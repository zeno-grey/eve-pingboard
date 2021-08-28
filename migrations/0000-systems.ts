import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('systems', table => {
      table.string('name', 255).primary()
      table.string('constellation', 255).notNullable()
      table.string('region', 255).notNullable()
    })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTable('systems')
}
