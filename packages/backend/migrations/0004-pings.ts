import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('pings', table => {
      table.increments('id', { primaryKey: true })
      table.text('text').notNullable()
      table.string('slack_channel_name', 255).notNullable()
      table.string('slack_channel_id', 255).notNullable()
      table.string('author', 255).notNullable()
      table.dateTime('sent_at').notNullable()
    })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTable('pings')
}
