import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('ping_template_groups', table => {
      table.integer('template_id').unsigned().references('id').inTable('ping_templates')
      table.string('group')
      table.primary(['template_id', 'group'])
    })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTable('ping_template_groups')
}
