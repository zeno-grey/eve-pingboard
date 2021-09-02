export interface Systems {
  name: string
  constellation: string
  region: string
}

declare module 'knex/types/tables' {
  interface Tables {
    systems: Systems
  }
}
