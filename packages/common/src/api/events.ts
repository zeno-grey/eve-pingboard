export interface ApiEventEntry {
  system: string
  priority: string
  structure: string
  type: string
  standing: string
  time: string
  result: string
  notes: string
  id: number
  constellation: string
  region: string
  updatedBy: string
  updatedAt: string
}

/** Response returned by the /api/events endpoint */
export interface ApiEventsResponse {
  /** The events matching the query. */
  events: ApiEventEntry[]
  /**
   * The number of events matching the query that were not returned because of the page size.
   */
  remaining: number
}
