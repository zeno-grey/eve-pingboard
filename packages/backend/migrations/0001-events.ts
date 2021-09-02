import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('events', table => {
      table.increments('id', { primaryKey: true })
      table.string('system', 255).references('name').inTable('systems')
      table.string('priority', 255)
      table.string('structure', 255)
      table.string('type', 255)
      table.string('standing', 255)
      table.dateTime('event_time')
      table.string('result', 255)
      table.string('notes', 255)
      table.string('updated_by', 255)
      table.dateTime('updated_at')
    })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTable('events')
}
