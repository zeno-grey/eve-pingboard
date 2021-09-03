import Router from '@koa/router'
import { ApiMeResponse } from '@ping-board/common'
import { EventsRepository } from '../database'
import { getRouter as getEventRouter } from './api/events'

export function getRouter(options: {
  events: EventsRepository,
}): Router {
  const router = new Router()

  router.get('/me', ctx => {
    const response: ApiMeResponse = ctx.session?.character
      ? {
          isLoggedIn: true,
          character: {
            id: ctx.session.character.id,
            name: ctx.session.character.name,
            roles: ctx.getRoles(),
          },
        }
      : { isLoggedIn: false }

    ctx.body = response
  })

  const apiRouter = getEventRouter(options)
  router.use('/events', apiRouter.routes(), apiRouter.allowedMethods())

  return router
}
