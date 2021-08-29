import Router from '@koa/router'

export function getRouter(): Router {
  const router = new Router()

  router.get('/me', ctx => {
    if (ctx.session?.character) {
      ctx.body = {
        isLoggedIn: true,
        character: {
          id: ctx.session.character.id,
          name: ctx.session.character.name,
        } ,
      }
    } else {
      ctx.body = {
        isLoggedIn: false,
      }
    }
  })

  return router
}
