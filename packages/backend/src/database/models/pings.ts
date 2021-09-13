import { Knex } from 'knex'

export interface Pings {
  id: number
  text: string
  slack_channel_name: string
  slack_channel_id: string
  author: string
  sent_at: Date
}

declare module 'knex/types/tables' {
  interface Tables {
    pings: Knex.CompositeTableType<
      Pings,
      Omit<Pings, 'id'>
    >
  }
}
