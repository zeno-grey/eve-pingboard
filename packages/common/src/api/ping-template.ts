import { NeucoreGroup } from '..'

export interface ApiPingTemplateInput {
  name: string
  slackChannelId: string
  template: string
  allowedNeucoreGroups: string[]
}

export interface ApiPingTemplate extends ApiPingTemplateInput {
  id: number
  slackChannelName: string
  updatedBy: string
  updatedAt: string
}

export interface ApiPingTemplatesResponse {
  templates: ApiPingTemplate[]
}

export interface ApiNeucoreGroupsResponse {
  neucoreGroups: NeucoreGroup[]
}
