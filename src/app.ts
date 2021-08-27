import Router from '@koa/router'
import Koa from 'koa'
import { getSessionMiddleware } from './middleware/session'
import { getRouter as getAuthRouter } from './routes/auth'
import { EveSSOClient } from './sso/eve-sso-client'

export function getApp(options: {
  eveSsoClient: EveSSOClient,
}): Koa {
  const app = new Koa()

  app.use(getSessionMiddleware(app))

  const authRouter = getAuthRouter(options)

  const appRouter = new Router()
  appRouter.use('/auth', authRouter.routes(), authRouter.allowedMethods())

  app.use(appRouter.routes()).use(appRouter.allowedMethods())

  return app
}
