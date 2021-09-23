import { Context } from 'koa'

export function extractDateQueryParam(ctx: Context, name: string): Date | null {
  const value = extractQueryParam(ctx, name)
  if (value) {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  return null
}

export function extractQueryParam(ctx: Context, name: string): string | null
export function extractQueryParam<T>(
  ctx: Context, name: string, map: (value: string) => T | null
): T | null
export function extractQueryParam<T>(
  ctx: Context, name: string, map?: (value: string) => T | null
): T | null {
  const param = ctx.query[name]
  if (typeof param === 'string') {
    if (map) return map(param)
    return param as unknown as T
  } else if (Array.isArray(param) && param.length > 0) {
    if (map) return map(param[0])
    return param[0] as unknown as T
  }
  return null
}
