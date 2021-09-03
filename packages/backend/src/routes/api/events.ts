import Router from '@koa/router'
import { ApiEventsResponse } from '@ping-board/common'
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

  return router
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
