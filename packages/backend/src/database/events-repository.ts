import { ApiEventEntry } from '@ping-board/common'
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
