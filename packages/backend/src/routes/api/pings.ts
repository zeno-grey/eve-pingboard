import Router from '@koa/router'
import { BadRequest, Forbidden, InternalServerError, NotFound, Unauthorized } from 'http-errors'
import * as yup from 'yup'
import {
  ApiNeucoreGroupsResponse,
  ApiPingInput,
  ApiPingTemplateInput,
  ApiPingTemplatesResponse,
  ApiSlackChannelsResponse,
} from '@ping-board/common'
import { UserRoles, userRoles } from '../../middleware/user-roles'
import { SlackClient, SlackRequestFailedError } from '../../slack/slack-client'
import { NeucoreClient } from '../../neucore'
import { dayjs } from '../../util/dayjs'
import { PingsRepository, UnknownTemplateError } from '../../database'

export function getRouter(options: {
  neucoreClient: NeucoreClient,
  slackClient: SlackClient,
  pings: PingsRepository,
}): Router {
  const router = new Router()

  router.post('/', userRoles.requireOneOf(UserRoles.PING), async ctx => {
    if (!ctx.session?.character) {
      throw new Unauthorized()
    }
    const ping = await validatePingInput(ctx.request.body)
    const template = await options.pings.getPingTemplate({ id: ping.templateId })
    if (!template) {
      throw new BadRequest('unvalid template id')
    }
    if (
      template.allowedNeucoreGroups.length > 0 &&
      !template.allowedNeucoreGroups.some(g =>
        ctx.session?.character?.neucoreGroups.some(({ name }) => g === name))
    ) {
      throw new Forbidden('you are not permitted to ping using this template')
    }
    try {
      const storedPing = await options.pings.addPing({
        text: ping.text,
        characterName: ctx.session.character.name,
        template,
        runInTransaction: async p => {
          const wrappedText = [
            '<!channel> PING',
            '\n\n',
            p.text,
            '\n\n',
            `> ${dayjs(p.sentAt).format('YYYY-MM-DD HH:mm:ss')} `,
            `- *${p.author}* to #${p.slackChannelName}`,
          ].join('')
          await options.slackClient.postMessage(template.slackChannelId, wrappedText)
        },
      })
      console.log('setting status')
      ctx.status = 201
      ctx.body = storedPing
    } catch (error) {
      if (error instanceof SlackRequestFailedError) {
        throw new InternalServerError(error.message)
      }
      throw error
    }
  })

  router.get('/channels', userRoles.requireOneOf(UserRoles.PING_TEMPLATES_WRITE), async ctx => {
    const channels = await options.slackClient.getChannels()
    const response: ApiSlackChannelsResponse = {
      channels: channels.flatMap(c => typeof c.id === 'string' && typeof c.name === 'string'
        ? [{ id: c.id, name: c.name }]
        : []
      ),
    }
    ctx.body = response
  })

  router.get('/neucore-groups',
    userRoles.requireOneOf(UserRoles.PING_TEMPLATES_WRITE),
    async ctx => {
      const appInfo = await options.neucoreClient.getAppInfo()
      const response: ApiNeucoreGroupsResponse = {
        neucoreGroups: appInfo.groups,
      }
      ctx.body = response
    }
  )

  router.get('/templates', userRoles.requireOneOf(UserRoles.PING), async ctx => {
    const templates = await options.pings.getPingTemplates()
    const canSeeAllTemplates = ctx.hasRoles(UserRoles.PING_TEMPLATES_WRITE)
    let response: ApiPingTemplatesResponse
    if (canSeeAllTemplates) {
      response = { templates }
    } else {
      const neucoreGroups = ctx.session?.character?.neucoreGroups?.map(g => g.name) ?? []
      response = {
        templates: templates.filter(t =>
          t.allowedNeucoreGroups.length === 0 ||
          t.allowedNeucoreGroups.some(g => neucoreGroups.includes(g))
        ),
      }
    }
    ctx.body = response
  })

  router.post('/templates', userRoles.requireOneOf(UserRoles.PING_TEMPLATES_WRITE), async ctx => {
    const template = await validateTemplateInput(ctx.request.body)
    const channelName = await options.slackClient.getChannelName(template.slackChannelId)
    const createdTemplate = await options.pings.addPingTemplate({
      input: {
        ...template,
        slackChannelName: channelName,
      },
      characterName: ctx.session?.character?.name ?? '',
    })
    ctx.body = createdTemplate
  })

  router.put('/templates/:templateId',
    userRoles.requireOneOf(UserRoles.PING_TEMPLATES_WRITE),
    async ctx => {
      const templateId = parseInt(ctx.params['templateId'] ?? '', 10)
      if (!isFinite(templateId)) {
        throw new BadRequest(`invalid templateId: ${ctx.params['templateId']}`)
      }
      const template = await validateTemplateInput(ctx.request.body)
      const channelName = await options.slackClient.getChannelName(template.slackChannelId)
      try {
        const updatedTemplate = await options.pings.setPingTemplate({
          id: templateId,
          template: {
            ...template,
            slackChannelName: channelName,
          },
          characterName: ctx.session?.character?.name ?? '',
        })
        ctx.body = updatedTemplate
      } catch (e) {
        if (e instanceof UnknownTemplateError) {
          throw new NotFound()
        }
        throw e
      }
    }
  )

  router.delete('/templates/:templateId',
    userRoles.requireOneOf(UserRoles.PING_TEMPLATES_WRITE),
    async ctx => {
      const templateId = parseInt(ctx.params['templateId'] ?? '', 10)
      if (!isFinite(templateId)) {
        throw new BadRequest(`invalid templateId: ${ctx.params['templateId']}`)
      }
      try {
        await options.pings.deletePingTemplate({ id: templateId })
        ctx.status = 204
      } catch (e) {
        if (e instanceof UnknownTemplateError) {
          throw new NotFound()
        }
        throw e
      }
    }
  )

  return router
}

const pingSchema = yup.object().noUnknown(true).shape({
  templateId: yup.number().required(),
  text: yup.string().min(1),
})
async function validatePingInput(
  raw: unknown
): Promise<ApiPingInput> {
  const isValid = await pingSchema.isValid(raw)
  if (isValid) {
    return pingSchema.cast(raw) as unknown as ApiPingInput
  }
  throw new BadRequest('invalid input')
}

const templateSchema = yup.object().noUnknown(true).shape({
  name: yup.string().required().min(1),
  slackChannelId: yup.string().min(1),
  template: yup.string().min(0),
  allowedNeucoreGroups: yup.array(yup.string().min(1)).min(0),
})
async function validateTemplateInput(
  raw: unknown
): Promise<ApiPingTemplateInput> {
  const isValid = await templateSchema.isValid(raw)
  if (isValid) {
    return templateSchema.cast(raw) as unknown as ApiPingTemplateInput
  }
  throw new BadRequest('invalid input')
}
