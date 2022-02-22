import Router from '@koa/router'
import { Unauthorized } from 'http-errors'
import { URL } from 'url'
import { EveSSOClient } from '../sso/eve-sso-client'
import { NeucoreClient, NeucoreResponseError } from '../neucore'

export function getRouter(options: {
  eveSsoClient: EveSSOClient,
  neucoreClient: NeucoreClient,
}): Router {
  const router = new Router()

  router.get('login', '/login', async ctx => {
    const redirect = ctx.query.postLoginRedirect
    const session = await ctx.resetSession({
      postLoginRedirect: extractPath(redirect),
    })

    ctx.redirect(await options.eveSsoClient.getLoginUrl(session.id))
  })

  router.post('/logout', async ctx => {
    await ctx.clearSession()
    ctx.status = 204
  })

  router.get('/callback', async ctx => {
    const session = ctx.session
    if (!session) {
      throw new Unauthorized('missing session')
    }
    const character = await options.eveSsoClient.handleCallback(session.id, ctx.query, ctx.href)

    try {
      await ctx.resetSession({
        character: {
          id: character.characterId,
          name: character.name,
        },
      })
      console.log(`Successfully logged in ${character.name}`)
      ctx.redirect(extractPath(session.postLoginRedirect))
    } catch (error) {
      if (error instanceof NeucoreResponseError && error.response.status === 404) {
        ctx.body = {
          message: 'You need to have a neucore account for this to work!',
        }
        ctx.status = 401
      } else {
        throw error
      }
    }
  })

  return router
}

/**
 * Extract the path of a given URL.
 * Used for the user redirect to prevent open redirect vulnerabilities.
 *
 * @param url the URL to extract the path from
 * @param fallback the URL to use if the given url is invalid
 * @returns the path part of the URL
 */
function extractPath(url: string | string[] | undefined, fallback = '/'): string {
  return new URL(
    (Array.isArray(url) ? url[0] : url) ?? fallback,
    'ignored://ignored'
  ).pathname
}
