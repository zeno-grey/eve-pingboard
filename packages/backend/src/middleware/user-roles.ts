import { Forbidden, Unauthorized } from 'http-errors'
import { Middleware } from 'koa'
import { UserRoles } from '@ping-board/common'
export { UserRoles }

declare module 'koa' {
  interface BaseContext extends Readonly<SessionContext> { }
}

export interface NeucoreGroupsProvider {
  getGroups(characterId: number, forceRefresh?: boolean): Promise<string[]>
}

interface SessionContext {
  getNeucoreGroups(fresh?: boolean): Promise<string[]>
  hasRoles(...roles: UserRoles[]): Promise<boolean>
  hasFreshRoles(...roles: UserRoles[]): Promise<boolean>
  hasAnyRole(...roles: UserRoles[]): Promise<boolean>
  hasAnyFreshRole(...roles: UserRoles[]): Promise<boolean>
  getRoles(): Promise<UserRoles[]>
  getFreshRoles(): Promise<UserRoles[]>
}

interface GetUserRolesMiddlewareOptions {
  neucoreToUserRolesMapping: Map<string, UserRoles[]>
  neucoreGroupsProvider: NeucoreGroupsProvider
}
export function getUserRolesMiddleware({
  neucoreToUserRolesMapping,
  neucoreGroupsProvider,
}: GetUserRolesMiddlewareOptions): Middleware {
  function getUserRoles(neucoreGroups: string[]): UserRoles[] {
    return neucoreGroups.flatMap(g => neucoreToUserRolesMapping.get(g) ?? [])
  }

  return (ctx, next) => {
    const roleCtx = ctx as SessionContext

    const getGroups = async (fresh: boolean) => {
      if (!ctx.session?.character) { return [] }
      return await neucoreGroupsProvider.getGroups(ctx.session.character.id, fresh)
    }
    roleCtx.getNeucoreGroups = getGroups

    const getRoles = async (fresh: boolean) => {
      const groups = await getGroups(fresh)
      return getUserRoles(groups)
    }

    roleCtx.hasRoles = async (...roles) => {
      const userRoles = await getRoles(false)
      return roles.every(r => userRoles.includes(r))
    }
    roleCtx.hasFreshRoles = async (...roles) => {
      const userRoles = await getRoles(true)
      return roles.every(r => userRoles.includes(r))
    }

    roleCtx.hasAnyRole = async (...roles) => {
      const userRoles = await getRoles(false)
      return roles.some(r => userRoles.includes(r))
    }
    roleCtx.hasAnyFreshRole = async (...roles) => {
      const userRoles = await getRoles(true)
      return roles.some(r => userRoles.includes(r))
    }

    roleCtx.getRoles = async () => getRoles(false)
    roleCtx.getFreshRoles = async () => getRoles(true)

    return next()
  }
}

export const userRoles = {
  requireOneOf: (...roles: UserRoles[]): Middleware => async (ctx, next) => {
    if (await ctx.hasAnyRole(...roles)) {
      return next()
    }
    if (!ctx.session?.character) {
      throw new Unauthorized()
    }
    throw new Forbidden('insuficcient roles')
  },
  requireOneFreshOf: (...roles: UserRoles[]): Middleware => async (ctx, next) => {
    if (await ctx.hasAnyFreshRole(...roles)) {
      return next()
    }
    if (!ctx.session?.character) {
      throw new Unauthorized()
    }
    throw new Forbidden('insuficcient roles')
  },
  requireAllOf: (...roles: UserRoles[]): Middleware => async (ctx, next) => {
    if (await ctx.hasRoles(...roles)) {
      return next()
    }
    if (!ctx.session?.character) {
      throw new Unauthorized()
    }
    throw new Forbidden('insuficcient roles')
  },
  requireAllFreshOf: (...roles: UserRoles[]): Middleware => async (ctx, next) => {
    if (await ctx.hasFreshRoles(...roles)) {
      return next()
    }
    if (!ctx.session?.character) {
      throw new Unauthorized()
    }
    throw new Forbidden('insuficcient roles')
  },
}
