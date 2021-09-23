export interface ScheduledPings {
  ping_id: number
  scheduled_for: Date
}

declare module 'knex/types/tables' {
  interface Tables {
    scheduled_pings: ScheduledPings
  }
}
