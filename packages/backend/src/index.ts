import { getApp } from './app'
import { knexInstance, EventsRepository } from './database'
import { NeucoreClient } from './neucore'
import { EveSSOClient } from './sso/eve-sso-client'
import { InMemorySessionProvider } from './util/in-memory-session-provider'
import { UserRoles } from '@ping-board/common'

async function main() {
  const eveSsoClient = new EveSSOClient({
    clientId: getFromEnv('SSO_CLIENT_ID'),
    clientSecret: getFromEnv('SSO_CLIENT_SECRET'),
    redirectUri: getFromEnv('SSO_REDIRECT_URI'),
  })
  const neucoreClient = new NeucoreClient({
    baseUrl: getFromEnv('CORE_URL'),
    appId: getFromEnv('CORE_APP_ID'),
    appToken: getFromEnv('CORE_APP_TOKEN'),
  })
  const sessionProvider = new InMemorySessionProvider()

  eveSsoClient.startAutoCleanup()
  sessionProvider.startAutoCleanup()

  const cookieSigningKeys = process.env.COOKIE_KEY?.split(' ')

  const knex = await knexInstance()
  const events = new EventsRepository(knex)
  const neucoreToUserRolesMapping = new Map<string, UserRoles[]>([
    ['brave', [UserRoles.EVENTS_READ]],
    ['pingboard.admin', [UserRoles.EVENTS_READ, UserRoles.EVENTS_WRITE]],
  ])

  const app = getApp({
    cookieSigningKeys,
    eveSsoClient,
    neucoreClient,
    sessionProvider,
    events,
    neucoreToUserRolesMapping,
  })

  const port = process.env.PORT ?? '3000'
  await new Promise<void>(res => app.listen(parseInt(port), res))

  console.log(`Listening on port ${port}`)
}

function getFromEnv(key: string): string {
  const value = process.env[key]
  if (typeof value !== 'string') {
    throw new Error(`Missing env variable: ${key}`)
  }
  return value
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
