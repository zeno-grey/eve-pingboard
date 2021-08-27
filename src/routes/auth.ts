import Router from '@koa/router'
import * as uuid from 'uuid'
import { Unauthorized } from 'http-errors'
import { EveSSOClient } from '../sso/eve-sso-client'

export function getRouter(options: {
  eveSsoClient: EveSSOClient,
}): Router {
  const router = new Router()

  router.get('/login', async ctx => {
    if (!ctx.session) {
      throw new Unauthorized('missing session')
    }

    const sessionId = uuid.v4()
    ctx.session.id = sessionId
    delete ctx.session.character
    ctx.redirect(await options.eveSsoClient.getLoginUrl(sessionId))
  })

  router.get('/callback', async ctx => {
    if (!ctx.session || !ctx.session.id) {
      throw new Unauthorized('missing session')
    }
    const sessionId = ctx.session.id
    const character = await options.eveSsoClient.handleCallback(sessionId, ctx.query, ctx.href)
    ctx.session.character = {
      id: character.characterId,
      name: character.name,
    }

    ctx.body = {
      character: ctx.session.character,
    }
  })

  return router
}
