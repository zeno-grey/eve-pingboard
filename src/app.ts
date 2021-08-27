import Koa from 'koa'

export function getApp(): Koa {
  const app = new Koa()

  app.use(ctx => {
    ctx.body = 'Hello, World!'
  })

  return app
}
