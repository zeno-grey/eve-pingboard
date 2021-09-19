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
    for (let tries = 1;; tries++) {
      try {
        await instance.raw('SET @@session.time_zone = "UTC"')
        break
      } catch (error) {
        if (tries > 9) {
          throw error
        }
        console.warn('Failed to connect to database, retrying in 5 seconds...', error)
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
  }
  return instance
}
