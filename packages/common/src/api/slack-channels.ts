export interface ApiSlackChannel {
  id: string
  name: string
}

export interface ApiSlackChannelsResponse {
  channels: ApiSlackChannel[]
}
