import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('ping_view_permissions', table => {
      table.string('neucore_group', 255)
      table.string('slack_channel_id', 255)
      table.primary(['neucore_group', 'slack_channel_id'])
    })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTable('ping_view_permissions')
}
