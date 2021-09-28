import fetch from 'node-fetch'
import type { Knex } from 'knex'
import type { Systems } from '../src/database/models'

export async function seed(knex: Knex): Promise<void> {
  const regionsUrl = 'https://www.fuzzwork.co.uk/dump/latest/mapRegions.csv'
  const constellationsUrl = 'https://www.fuzzwork.co.uk/dump/latest/mapConstellations.csv'
  const solarSystemsUrl = 'https://www.fuzzwork.co.uk/dump/latest/mapSolarSystems.csv'

  console.log('Downloading regions...')
  const regionsCsv = await fetch(regionsUrl)
  const regions = new Map((await regionsCsv.text()).split('\n').slice(1).map(line => {
    const [regionId, regionName] = line.split(',', 2)
    return [parseInt(regionId), regionName]
  }))

  console.log('Downloading constellations...')
  const constellationsCsv = await fetch(constellationsUrl)
  const constellations = new Map((await constellationsCsv.text()).split('\n').slice(1).map(line => {
    const [_, constellationId, constellationName] = line.split(',', 3)
    return [parseInt(constellationId), constellationName]
  }))

  console.log('Downloading solar systems...')
  const solarSystemsCsv = await fetch(solarSystemsUrl)
  const solarSystems = (await solarSystemsCsv.text()).split('\n').slice(1).map(line => {
    const [regionId, constellationId, _, solarSystemName] = line.split(',', 4)
    return {
      name: solarSystemName,
      constellation: constellations.get(parseInt(constellationId)) ?? null,
      region: regions.get(parseInt(regionId)) ?? null,
    }
  }).filter((s): s is Systems => !!s.constellation && !!s.region)

  await knex('systems')
    .insert(solarSystems)
    .onConflict('name').merge()

  console.log('Done')
}
