import { Knex } from 'knex'

export interface Events {
  id: number
  system: string
  priority: string | null
  structure: string | null
  type: string | null
  standing: string | null
  event_time: Date | null
  result: string | null
  notes: string | null
  updated_by: string | null
  updated_at: Date | null
}

declare module 'knex/types/tables' {
  interface Tables {
    events: Knex.CompositeTableType<
      Events,
      Partial<Omit<Events, 'id'>> & Pick<Events, 'system'>
    >
  }
}
