import KnexConst, { Knex } from 'knex'

let instance: Knex | null = null
export async function knexInstance(): Promise<Knex>  {
  if (!instance) {
    instance = KnexConst({
      client: 'mysql2',
      connection: process.env.DB_URL,
      pool: {
        min: 2,
        max: 10,
      },
    })
    await instance.raw('SET @@session.time_zone = "UTC"')
  }
  return instance
}
