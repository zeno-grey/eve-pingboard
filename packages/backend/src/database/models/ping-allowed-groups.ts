import { Knex } from 'knex'

export interface PingTemplateGroups {
  template_id: number
  group: string
}

declare module 'knex/types/tables' {
  interface Tables {
    ping_template_groups: Knex.CompositeTableType<
      PingTemplateGroups,
      Omit<PingTemplateGroups, 'id'>
    >
  }
}
