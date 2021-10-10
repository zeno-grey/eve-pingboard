export interface SolarSystem {
  name: string
  constellation: string
  region: string
}

export interface ApiSolarSystemsResponse {
  solarSystems: SolarSystem[]
}
