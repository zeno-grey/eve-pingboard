import { getApp } from './app'
import { EveSSOClient } from './sso/eve-sso-client'

async function main() {
  const eveSsoClient = new EveSSOClient({
    clientId: getFromEnv('SSO_CLIENT_ID'),
    clientSecret: getFromEnv('SSO_CLIENT_SECRET'),
    redirectUri: getFromEnv('SSO_REDIRECTURI'),
  })

  const app = getApp({
    eveSsoClient,
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
