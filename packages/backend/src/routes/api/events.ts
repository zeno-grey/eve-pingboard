import Router from '@koa/router'
import { BadRequest } from 'http-errors'
import * as yup from 'yup'
import { ApiEventEntryInput, ApiEventsResponse } from '@ping-board/common'
import { userRoles, UserRoles } from '../../middleware/user-roles'
import { EventsRepository } from '../../database'
import { Context } from 'koa'

export function getRouter(options: {
  events: EventsRepository,
}): Router {
  const router = new Router()

  router.get('/', userRoles.requireOneOf(UserRoles.EVENTS_READ), async ctx => {
    const count = extractQueryParam(ctx, 'count', v => {
      const n = parseInt(v, 10)
      return Number.isFinite(n) && n > 0 ? Math.ceil(n) : null
    })
    const before = extractQueryParamDate(ctx, 'before')
    const after = extractQueryParamDate(ctx, 'after')
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
    const eventId = extractQueryParam(ctx, 'eventId', parseInt)
    if (!eventId || !Number.isFinite(eventId) || eventId < 0) {
      throw new BadRequest()
    }
    const event = await validateEventInput(ctx.request.body)
    const characterName = ctx.session?.character?.name ?? ''
    const response = await options.events.setEvent(eventId, event, characterName)
    ctx.body = response
  })

  router.delete('/:eventId', userRoles.requireOneOf(UserRoles.EVENTS_WRITE), async ctx => {
    const eventId = extractQueryParam(ctx, 'eventId', parseInt)
    if (!eventId || !Number.isFinite(eventId) || eventId < 0) {
      throw new BadRequest()
    }
    await options.events.deleteEvent(eventId)
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

function extractQueryParamDate(ctx: Context, name: string): Date | null {
  const value = extractQueryParam(ctx, name)
  if (value) {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  return null
}

function extractQueryParam(ctx: Context, name: string): string | null
function extractQueryParam<T>(
  ctx: Context, name: string, map: (value: string) => T | null
): T | null
function extractQueryParam<T>(
  ctx: Context, name: string, map?: (value: string) => T | null
): T | null {
  const param = ctx.query[name]
  if (typeof param === 'string') {
    if (map) return map(param)
    return param as unknown as T
  } else if (Array.isArray(param) && param.length > 0) {
    if (map) return map(param[0])
    return param[0] as unknown as T
  }
  return null
}
