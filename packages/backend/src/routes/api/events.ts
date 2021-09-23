import Router from '@koa/router'
import { BadRequest, NotFound } from 'http-errors'
import * as yup from 'yup'
import { ApiEventEntryInput, ApiEventsResponse } from '@ping-board/common'
import { userRoles, UserRoles } from '../../middleware/user-roles'
import { EventsRepository } from '../../database'
import { extractQueryParam, extractDateQueryParam } from '../../util/extract-query-param'

export function getRouter(options: {
  events: EventsRepository,
}): Router {
  const router = new Router()

  router.get('/', userRoles.requireOneOf(UserRoles.EVENTS_READ), async ctx => {
    const count = extractQueryParam(ctx, 'count', v => {
      const n = parseInt(v, 10)
      return Number.isFinite(n) && n > 0 ? Math.ceil(n) : null
    })
    const before = extractDateQueryParam(ctx, 'before')
    const after = extractDateQueryParam(ctx, 'after')
    const [events, eventCount] = await Promise.all([
      options.events.getEvents({ before, after, count }),
      options.events.getNumberOfEvents({ before, after }),
    ])

    const response: ApiEventsResponse = {
      events,
      remaining: eventCount - events.length,
    }
    ctx.body = response
  })

  router.post('/', userRoles.requireOneOf(UserRoles.EVENTS_WRITE), async ctx => {
    const event = await validateEventInput(ctx.request.body)
    const response = await options.events.addEvent(event, ctx.session?.character?.name ?? '')
    ctx.body = response
    ctx.status = 201
  })

  router.put('/:eventId', userRoles.requireOneOf(UserRoles.EVENTS_WRITE), async ctx => {
    const eventId = parseInt(ctx.params['eventId'])
    if (!Number.isFinite(eventId) || eventId < 0) {
      throw new BadRequest()
    }
    const event = await validateEventInput(ctx.request.body)
    const characterName = ctx.session?.character?.name ?? ''
    const response = await options.events.setEvent(eventId, event, characterName)
    if (!response) {
      throw new NotFound()
    }
    ctx.body = response
  })

  router.delete('/:eventId', userRoles.requireOneOf(UserRoles.EVENTS_WRITE), async ctx => {
    const eventId = parseInt(ctx.params['eventId'])
    if (!Number.isFinite(eventId) || eventId < 0) {
      throw new BadRequest()
    }
    const success = await options.events.deleteEvent(eventId)
    if (!success) {
      throw new NotFound()
    }
    ctx.status = 204
  })

  return router
}

const eventSchema = yup.object().noUnknown(true).shape({
  system: yup.string().required(),
  priority: yup.string().required(),
  structure: yup.string().required(),
  type: yup.string().required(),
  standing: yup.string().required(),
  time: yup.date().required(),
  result: yup.string().required(),
  notes: yup.string().min(0),
})

async function validateEventInput(
  raw: unknown
): Promise<ApiEventEntryInput> {
  const isValid = await eventSchema.isValid(raw)
  if (isValid) {
    return eventSchema.cast(raw) as unknown as ApiEventEntryInput
  }
  throw new BadRequest('invalid input')
}
