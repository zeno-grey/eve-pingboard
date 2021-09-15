export interface ApiPingViewPermissionsByGroupInput {
  allowedSlackChannelIds: string[]
}

export interface ApiPingViewPermissionsByChannelInput {
  allowedNeucoreGroups: string[]
}

export interface ApiPingViewPermission {
  slackChannelId: string
  slackChannelName: string
  neucoreGroup: string
}

export interface ApiPingViewPermissions {
  viewPermissions: Array<ApiPingViewPermission>
}
