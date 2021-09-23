import { Knex } from 'knex'

export interface PingTemplates {
  id: number
  name: string
  slack_channel_name: string
  slack_channel_id: string
  template: string
  updated_by: string
  updated_at: Date
  allow_scheduling: boolean
}

declare module 'knex/types/tables' {
  interface Tables {
    ping_templates: Knex.CompositeTableType<
      PingTemplates,
      Omit<PingTemplates, 'id'>
    >
  }
}
