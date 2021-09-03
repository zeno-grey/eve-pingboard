import { ApiEventEntry, ApiEventEntryInput } from '@ping-board/common'
import { NotFound } from 'http-errors'
import { Knex } from 'knex'
import { Events, Systems } from './models'

export class EventsRepository {
  constructor(
    private readonly knex: Knex,
  ) {}

  async getEvents(options: {
    before?: Date | null
    after?: Date | null
    count?: number | null
  }): Promise<ApiEventEntry[]> {
    let query = this.knex('events')
      .select('*')
      .leftJoin('systems', 'events.system', 'systems.name')
    if (options.before) {
      query = query.where('event_time', '<', options.before)
    }
    if (options.after) {
      query = query.where('event_time', '>=', options.after)
    }
    query = query.limit(Math.min(Math.max(1, options.count ?? 40), 40))
    const events = await query
    return events.map(rawToEvent)
  }

  async getNumberOfEvents(options: {
    before?: Date | null,
    after?: Date | null,
  }): Promise<number> {
    let query = this.knex('events')
      .count({ count: 'id' })
    if (options.before) {
      query = query.where('event_time', '<', options.before)
    }
    if (options.after) {
      query = query.where('event_time', '>=', options.after)
    }
    const count = await query
    if (count.length > 0 && typeof count[0].count === 'number') {
      return count[0].count
    }
    return 0
  }

  async getEvent(id: number): Promise<ApiEventEntry> {
    const event = await this.knex('events')
      .select('*')
      .leftJoin('systems', 'events.system', 'systems.name')
      .where('id', id)

    if (event.length > 0) {
      return rawToEvent(event[0])
    }
    throw new Error('not found')
  }

  async addEvent(timer: ApiEventEntryInput, characterName: string): Promise<ApiEventEntry> {
    const inserted = await this.knex('events')
      .insert({
        system: timer.system,
        event_time: new Date(timer.time),
        notes: timer.notes,
        priority: timer.priority,
        result: timer.result,
        standing: timer.standing,
        structure: timer.structure,
        type: timer.type,
        updated_by: characterName,
        updated_at: new Date(),
      })

    if (inserted.length > 0) {
      return await this.getEvent(inserted[0])
    }
    throw new Error('failed to add event')
  }

  async setEvent(
    id: number, timer: ApiEventEntryInput, characterName: string
  ): Promise<ApiEventEntry> {
    const updateCount = await this.knex('events')
      .where({ id })
      .update({
        system: timer.system,
        priority: timer.priority,
        structure: timer.structure,
        type: timer.type,
        standing: timer.standing,
        event_time: new Date(timer.time),
        result: timer.result,
        notes: timer.notes,
        updated_by: characterName,
        updated_at: new Date(),
      })
    if (updateCount < 1) {
      throw new NotFound()
    }
    return await this.getEvent(id)
  }
}

function rawToEvent(raw: Events & Systems): ApiEventEntry {
  return {
    id: raw.id,
    system: raw.system,
    constellation: raw.constellation ?? '',
    region: raw.region ?? '',
    priority: raw.priority ?? '',
    structure: raw.structure ?? '',
    type: raw.type ?? '',
    standing: raw.standing ?? '',
    time: raw.event_time?.toISOString() ?? '',
    result: raw.result || 'No data',
    notes: raw.notes ?? '',
    updatedAt: raw.updated_at?.toISOString() ?? '',
    updatedBy: raw.updated_by ?? '',
  }
}
