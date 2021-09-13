import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('ping_templates', table => {
      table.increments('id', { primaryKey: true })
      table.string('name', 255).notNullable()
      table.string('slack_channel_name', 255).notNullable()
      table.string('slack_channel_id', 255).notNullable()
      table.text('template').notNullable()
      table.string('updated_by', 255).notNullable()
      table.dateTime('updated_at').notNullable()
    })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTable('ping_templates')
}
