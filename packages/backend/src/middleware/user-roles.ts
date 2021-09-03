import { Forbidden, Unauthorized } from 'http-errors'
import { Middleware } from 'koa'
import { UserRoles } from '@ping-board/common'
export { UserRoles }

declare module 'koa' {
  interface BaseContext extends Readonly<SessionContext> { }
}

interface SessionContext {
  hasRoles(...roles: UserRoles[]): boolean
  getRoles(): UserRoles[]
}

interface GetUserRolesMiddlewareOptions {
  neucoreToUserRolesMapping: Map<string, UserRoles[]>
}
export function getUserRolesMiddleware({
  neucoreToUserRolesMapping,
}: GetUserRolesMiddlewareOptions): Middleware {
  return (ctx, next) => {
    const neucoreGroups = (ctx.session?.character?.neucoreGroups ?? []).map(g => g.name)
    const userRoles = new Set(neucoreGroups.flatMap(g => neucoreToUserRolesMapping.get(g) ?? []))

    const roleCtx = ctx as SessionContext
    roleCtx.hasRoles = (...roles: UserRoles[]) => roles.every(r => userRoles.has(r))
    roleCtx.getRoles = () => [...userRoles]

    return next()
  }
}

export const userRoles = {
  requireOneOf: (...roles: UserRoles[]): Middleware => (ctx, next) => {
    if (roles.some(r => ctx.hasRoles(r))) {
      return next()
    }
    if (!ctx.session?.character) {
      throw new Unauthorized()
    }
    throw new Forbidden('insuficcient roles')
  },
  requireAllOf: (...roles: UserRoles[]): Middleware => (ctx, next) => {
    if (ctx.hasRoles(...roles)) {
      return next()
    }
    if (!ctx.session?.character) {
      throw new Unauthorized()
    }
    throw new Forbidden('insuficcient roles')
  },
}
