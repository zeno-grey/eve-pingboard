import * as jwt from 'jsonwebtoken'

interface RawEveJWT extends jwt.JwtPayload {
  scp?: string | string[]
  jti: string
  kid: string
  sub: string
  azp: string
  tenant: string
  tier: string
  region: string
  name: string
  owner: string
  exp: number
  iss: string
}

export interface EveJWT {
  token: string,
  scopes: string[]
  /** JWT ID (unique identifier for this token) */
  jti: string
  characterId: number
  name: string
  owner: string
  expiresAt: Date
}
export function parseEveJWT(token: string, clientId: string): EveJWT {
  const parsed = jwt.decode(token, { json: true }) as Partial<RawEveJWT> | null
  if (!parsed) {
    throw new Error('invalid Eve JWT')
  }

  if (
    typeof parsed.jti !== 'string' ||
    typeof parsed.name !== 'string' ||
    typeof parsed.sub !== 'string' ||
    typeof parsed.owner !== 'string' ||
    typeof parsed.exp !== 'number' ||
    parsed.azp !== clientId ||
    parsed.iss !== 'login.eveonline.com'
  ) {
    throw new Error('invalid Eve JWT')
  }

  const scopes = 'scp' in parsed
    ? Array.isArray(parsed.scp)
      ? parsed.scp.filter((s): s is string => typeof s === 'string')
      : typeof parsed.scp === 'string'
        ? [parsed.scp]
        : []
    : []

  const characterIdStr = parsed.sub.match(/^CHARACTER:EVE:(\d+)$/)
  if (!characterIdStr) { throw new Error('invalid Eve JWT') }
  const characterId = parseInt(characterIdStr[1])
  if (!Number.isFinite(characterId)) { throw new Error('invalid Eve JWT') }

  return {
    token,
    scopes,
    jti: parsed.jti,
    characterId,
    name: parsed.name,
    owner: parsed.owner,
    expiresAt: new Date(parsed.exp * 1000),
  }
}
