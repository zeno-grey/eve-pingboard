import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('scheduled_pings', table => {
      table.integer('ping_id').unsigned().primary().references('id').inTable('pings')
      table.dateTime('scheduled_for').notNullable()
    })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTable('scheduled_pings')
}
