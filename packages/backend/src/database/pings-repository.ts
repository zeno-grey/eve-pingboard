import { ApiPing, ApiPingTemplate, ApiPingTemplateInput } from '@ping-board/common'
import { Knex } from 'knex'
import { PingTemplateGroups } from './models/ping-allowed-groups'
import { PingTemplates } from './models/ping-templates'
import { Pings } from './models/pings'

export class UnknownTemplateError extends Error {
  constructor(templateId: number) {
    super(`could not find a template with id ${templateId}`)
  }
}

export class PingCreationFailedError extends Error {
  constructor() {
    super('failed to create ping')
  }
}

export class TemplateCreationError extends Error {
  constructor() {
    super('failed to create template')
  }
}


export class PingsRepository {
  constructor(
    private readonly knex: Knex,
  ) {}

  async addPing(options: {
    text: string,
    template: ApiPingTemplate,
    characterName: string,
    runInTransaction?: (ping: ApiPing) => void | Promise<void>
  }): Promise<ApiPing> {
    return await this.knex.transaction(async trx => {
      const pingId = (await trx('pings').insert({
        author: options.characterName,
        sent_at: new Date(),
        slack_channel_id: options.template.slackChannelId,
        slack_channel_name: options.template.slackChannelName,
        text: options.text,
      }))[0]
      const storedPing = (await trx('pings').select('*').where({ id: pingId }))[0]
      if (!storedPing) {
        throw new PingCreationFailedError()
      }
      const apiPing = rawToPing(storedPing)
      if (options.runInTransaction) {
        await options.runInTransaction(apiPing)
      }
      return apiPing
    })
  }

  async getPingTemplates(): Promise<ApiPingTemplate[]> {
    const [templates, templateGroups] = await Promise.all([
      this.knex('ping_templates').select('*').orderBy('name', 'asc'),
      this.knex('ping_template_groups').select('*'),
    ])

    return templates.map(t =>
      rawToPingTemplate(t, templateGroups.filter(g => g.template_id === t.id))
    )
  }

  async getPingTemplate(options: {
    id: number,
    knex?: Knex, // Required when running inside a transaction
  }): Promise<ApiPingTemplate | null> {
    const knex = options.knex || this.knex

    const template = (await knex('ping_templates')
      .select('*')
      .where({ id: options.id })
    )[0]
    if (!template) {
      return null
    }

    const templateGroups = await knex('ping_template_groups')
      .select('group')
      .where({ template_id: template.id })

    return rawToPingTemplate(template, templateGroups)
  }

  async addPingTemplate(options: {
    input: ApiPingTemplateInput & Pick<ApiPingTemplate, 'slackChannelName'>,
    characterName: string,
  }): Promise<ApiPingTemplate> {
    return await this.knex.transaction(async trx => {
      const template = await trx('ping_templates')
        .insert({
          name: options.input.name,
          slack_channel_id: options.input.slackChannelId,
          slack_channel_name: options.input.slackChannelName,
          template: options.input.template,
          updated_at: new Date(),
          updated_by: options.characterName,
        })

      if (template.length !== 1) {
        throw new TemplateCreationError()
      }

      const templateId = template[0]
      if (options.input.allowedNeucoreGroups.length > 0) {
        await trx('ping_template_groups')
          .insert(options.input.allowedNeucoreGroups.map(group => ({
            template_id: templateId,
            group,
          })))
      }

      const stored = await this.getPingTemplate({ id: templateId, knex: trx })
      if (!stored) {
        throw new TemplateCreationError()
      }
      return stored
    })
  }

  async setPingTemplate(options: {
    id: number,
    template: ApiPingTemplateInput & Pick<ApiPingTemplate, 'slackChannelName'>,
    characterName: string,
  }): Promise<ApiPingTemplate | null> {
    return await this.knex.transaction(async trx => {
      console.log(options)

      // Remove all previously allowed groups
      await trx('ping_template_groups')
        .delete()
        .where({ template_id: options.id })

      const updateCount = await trx('ping_templates')
        .update({
          name: options.template.name,
          slack_channel_id: options.template.slackChannelId,
          slack_channel_name: options.template.slackChannelName,
          template: options.template.template,
          updated_at: new Date(),
          updated_by: options.characterName,
        })
        .where({ id: options.id })

      if (updateCount !== 1) {
        throw new UnknownTemplateError(options.id)
      }

      const allowedGroups = await trx('ping_template_groups')
        .select('*')
        .where({ template_id: options.id })
      console.log(allowedGroups)

      if (options.template.allowedNeucoreGroups.length > 0) {
        await trx('ping_template_groups')
          .insert(options.template.allowedNeucoreGroups.map(group => ({
            template_id: options.id,
            group,
          })))
      }

      const stored = await this.getPingTemplate({ id: options.id, knex: trx })
      if (!stored) {
        throw new TemplateCreationError()
      }
      return stored
    })
  }

  async deletePingTemplate(options: {
    id: number,
  }): Promise<void> {
    await this.knex.transaction(async trx => {
      await trx('ping_template_groups')
        .delete()
        .where({ template_id: options.id })

      const deleteCount = await trx('ping_templates')
        .delete()
        .where({ id: options.id })

      if (deleteCount < 1) {
        throw new UnknownTemplateError(options.id)
      }
    })
  }
}

function rawToPing(ping: Pings): ApiPing {
  return {
    id: ping.id,
    text: ping.text,
    slackChannelId: ping.slack_channel_id,
    slackChannelName: ping.slack_channel_name,
    author: ping.author,
    sentAt: ping.sent_at.toISOString(),
  }
}

function rawToPingTemplate(
  template: PingTemplates,
  groups: Pick<PingTemplateGroups, 'group'>[]
): ApiPingTemplate {
  return {
    id: template.id,
    name: template.name,
    slackChannelId: template.slack_channel_id,
    slackChannelName: template.slack_channel_name,
    template: template.template,
    allowedNeucoreGroups: groups.map(g => g.group),
    updatedAt: template.updated_at.toISOString(),
    updatedBy: template.updated_by,
  }
}