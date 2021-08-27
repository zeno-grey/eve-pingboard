import Koa, { Middleware } from 'koa'
import session from 'koa-session'

// Augment the Session type with the data we want to store inside the session
// (koa-session allows for storing arbitrary data in sessions)
declare module 'koa-session' {
  interface Session {
    id?: string
    character?: {
      id: number
      name: string
    }
  }
}

export function getSessionMiddleware(app: Koa): Middleware {
  return session({
    key: 'pingboard',
    maxAge: 1000 * 60 * 60,
    signed: !!process.env.COOKIE_KEYS,
  }, app)
}
