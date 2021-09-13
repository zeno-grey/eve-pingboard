import { NeucoreGroup } from '@ping-board/common'

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
  groups: NeucoreGroup[]
  trackingLastUpdate: string
  autoAllowlist: true
}

/** An alliance as obtained from Neucore. */
export interface Alliance {
  id: number
  name: string
  ticker: string
  groups: NeucoreGroup[]
}

/** Response returned Neucore's /app/v1/show endpoint. */
export interface NeucoreApplicationInfo {
  id: number
  name: string
  roles: string[]
  groups: NeucoreGroup[]
  eveLogins: Array<{
    id: number
    name: string
    description: string
    esiScopes: string
    eveRoles: string[]
  }>
}
