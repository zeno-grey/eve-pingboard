/** A Neucore group. */
export interface NeucoreGroup {
  id: number
  name: string
  description?: string | null
  visibility: 'public' | 'private'
  autoAccept: boolean
}
