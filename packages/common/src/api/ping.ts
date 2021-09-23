export interface ApiPingInput {
  templateId: number
  text: string
  scheduledTitle?: string
  scheduledFor?: string
}

export interface ApiPing {
  id: number
  text: string
  slackChannelName: string
  slackChannelId: string
  scheduledTitle?: string
  scheduledFor?: string
  author: string
  sentAt: string
}

export interface ApiPingsResponse {
  pings: ApiPing[]
  remaining: number
}

export type ApiScheduledPing =
  & Omit<ApiPing, 'scheduledTitle' | 'scheduledFor'>
  & Required<Pick<ApiPing, 'scheduledTitle' | 'scheduledFor'>>

export function isScheduledPing(ping: ApiPing): ping is ApiScheduledPing {
  return typeof ping.scheduledFor === 'string' && typeof ping.scheduledTitle === 'string'
}

export interface ApiScheduledPingsResponse {
  pings: ApiScheduledPing[]
  remaining: number
}
