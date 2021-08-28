import Koa, { Middleware, Next } from 'koa'

export interface SessionProvider {
  createSession(data: Omit<Session, 'id'>): Promise<Readonly<Session>>
  updateSession(session: Session): Promise<void>
  getSession(sessionId: string): Promise<Readonly<Session> | null>
  deleteSession(sessionId: string): Promise<void>
}

export interface Session {
  id: string
  expiresAt: Date
  postLoginRedirect?: string
  character?: {
    id: number
    name: string
  }
}

interface SessionContext {
  /** Deletes the current session (if available) and creates a new one with the given content. */
  resetSession: (content?: Omit<Session, 'id' | 'expiresAt'>) => Promise<Session>

  /** Deletes the current session and sets it to `null` */
  clearSession: () => Promise<void>

  session?: Readonly<Session> | null
}

declare module 'koa' {
  interface BaseContext extends Readonly<SessionContext> { }
}

export interface GetSessionMiddlewareOptions {
  app: Koa
  sessionCookieName: string
  sessionProvider: SessionProvider
}

export function getSessionMiddleware({
  app,
  sessionCookieName,
  sessionProvider,
}: GetSessionMiddlewareOptions): Middleware {
  const isSigned = Array.isArray(app.keys) && app.keys.length > 0
  if (!isSigned) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Must set app.keys when running in production')
    } else {
      console.warn('app.keys is not set, session cookies will not be signed!')
    }
  }

  return async (ctx, next: Next) => {
    // Alias the context to work around the readonly restrictions of the regular context
    const sessionCtx = ctx as SessionContext

    sessionCtx.resetSession = async content => {
      const sessionId = ctx.session?.id
      if (sessionId) {
        await sessionProvider.deleteSession(sessionId)
      }
      const sessionTimeout = 1000 * 60 * 60
      const expiresAt = new Date(Date.now() + sessionTimeout)
      const newSession = await sessionProvider.createSession({
        expiresAt,
        ...content,
      })
      ctx.cookies.set(sessionCookieName, newSession.id, {
        httpOnly: true,
        signed: isSigned,
        overwrite: true,
        sameSite: 'lax',
        expires: expiresAt,
      })
      sessionCtx.session = newSession
      return newSession
    }
    sessionCtx.clearSession = async () => {
      if (ctx.session) {
        await sessionProvider.deleteSession(ctx.session.id)
        sessionCtx.session = null
      }
      ctx.cookies.set(sessionCookieName, null)
    }

    const sessionId = ctx.cookies.get(sessionCookieName, { signed: isSigned })
    if (sessionId) {
      sessionCtx.session = await sessionProvider.getSession(sessionId) ?? null
    }

    return next()
  }
}
