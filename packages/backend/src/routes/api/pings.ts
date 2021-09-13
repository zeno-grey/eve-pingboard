import Router from '@koa/router'
import { BadRequest, Forbidden, InternalServerError, Unauthorized } from 'http-errors'
import * as yup from 'yup'
import {
  ApiPingInput,
  ApiPingTemplatesResponse,
} from '@ping-board/common'
import { UserRoles, userRoles } from '../../middleware/user-roles'
import { SlackClient, SlackRequestFailedError } from '../../slack/slack-client'
import { dayjs } from '../../util/dayjs'
import { PingsRepository } from '../../database'

export function getRouter(options: {
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
