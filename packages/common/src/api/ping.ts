export interface ApiPingInput {
  templateId: number
  text: string
}

export interface ApiPing {
  id: number
  text: string
  slackChannelName: string
  slackChannelId: string
  author: string
  sentAt: string
}
