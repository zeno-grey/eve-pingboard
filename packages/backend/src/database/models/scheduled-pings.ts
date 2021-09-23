export interface ScheduledPings {
  ping_id: number
  title: string
  scheduled_for: Date
}

declare module 'knex/types/tables' {
  interface Tables {
    scheduled_pings: ScheduledPings
  }
}
