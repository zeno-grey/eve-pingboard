import Router from '@koa/router'
import { ApiMeResponse } from '@ping-board/common'

export function getRouter(): Router {
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

  return router
}
