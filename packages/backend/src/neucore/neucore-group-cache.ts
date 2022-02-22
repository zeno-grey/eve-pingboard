import { InMemoryTTLCache } from '../util/in-memory-ttl-cache'
import { NeucoreGroupsProvider } from '../middleware/user-roles'
import { NeucoreClient } from './neucore-client'

export class NeucoreGroupCache implements NeucoreGroupsProvider {
  #cache: InMemoryTTLCache<number, string[]>

  constructor(options: {
    neucoreClient: NeucoreClient
    cacheTTL: number
  }) {
    this.#cache = new InMemoryTTLCache({
      defaultTTL: options.cacheTTL,
      get: async characterId => {
        console.log('getting neucore groups for', characterId)
        const groups = await options.neucoreClient.getCharacterGroups(characterId)
        return { value: groups.map(g => g.name) }
      },
    })
  }

  async getGroups(characterId: number, forceRefresh = false): Promise<string[]> {
    return await this.#cache.get(characterId, forceRefresh)
  }
}
