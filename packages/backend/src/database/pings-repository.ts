import { ApiPing, ApiPingTemplate } from '@ping-board/common'
import { Knex } from 'knex'
import { PingTemplateGroups } from './models/ping-allowed-groups'
import { PingTemplates } from './models/ping-templates'
import { Pings } from './models/pings'

export class PingCreationFailedError extends Error {
  constructor() {
    super('failed to create ping')
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
