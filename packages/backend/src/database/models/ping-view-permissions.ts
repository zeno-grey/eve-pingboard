import { Knex } from 'knex'

export interface PingViewPermissions {
  neucore_group: string
  slack_channel_id: string
}

declare module 'knex/types/tables' {
  interface Tables {
    ping_view_permissions: Knex.CompositeTableType<
      PingViewPermissions,
      Omit<PingViewPermissions, 'id'>
    >
  }
}
