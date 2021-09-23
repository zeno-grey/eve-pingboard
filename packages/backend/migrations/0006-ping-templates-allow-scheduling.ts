import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .alterTable('ping_templates', table => {
      table.boolean('allow_scheduling').notNullable().defaultTo(false)
    })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .alterTable('ping_templates', table => {
      table.dropColumn('allow_scheduling')
    })
}
