import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .alterTable('pings', table => {
      table.string('slack_message_id').nullable()
    })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .alterTable('pings', table => {
      table.dropColumn('slack_message_id')
    })
}
