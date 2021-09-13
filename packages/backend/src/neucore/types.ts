/** A Neucore group. */
export interface Group {
  id: number
  name: string
  description?: string | null
  visibility: 'public' | 'private'
  autoAccept: boolean
}

/** A character as obtained from Neucore. */
export interface Character {
  id: number
  name: string
  main: boolean
  validToken: boolean
  validTokenTime: string
  created: string
  lastUpdate: string
  corporation: Corporation
  characterNameChanges: Array<{
    oldName: string
    changeDate: string
  }>
}

/** A corporation as obtained from Neucore. */
export interface Corporation {
  id: number
  name: string
  ticker: string
  alliance: Alliance
  groups: Group[]
  trackingLastUpdate: string
  autoAllowlist: true
}

/** An alliance as obtained from Neucore. */
export interface Alliance {
  id: number
  name: string
  ticker: string
  groups: Group[]
}

/** Response returned Neucore's /app/v1/show endpoint. */
export interface NeucoreApplicationInfo {
  id: number
  name: string
  roles: string[]
  groups: Group[]
  eveLogins: Array<{
    id: number
    name: string
    description: string
    esiScopes: string
    eveRoles: string[]
  }>
}
