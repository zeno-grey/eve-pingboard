import { LogLevel, WebClient } from '@slack/web-api'
import { Channel } from '@slack/web-api/dist/response/ConversationsListResponse'

export class InvalidChannelIdError extends Error {
  constructor(id: string) {
    super(`invalid slack channel id: ${id}`)
  }
}

export class SlackRequestFailedError extends Error {
  constructor(error?: string) {
    super(`slack request failed: ${error || 'unknown reason'}`)
  }
}

export class SlackClient {
  private client: WebClient

  constructor(token: string) {
    this.client = new WebClient(token, {
      logLevel: LogLevel.DEBUG,
    })
  }

  async getChannels(): Promise<Channel[]> {
    let channels: Channel[] = []
    let cursor: string | undefined
    do {
      const page = await this.client.conversations.list({
        types: [
          'public_channel',
          'private_channel',
        ].join(','),
        exclude_archived: true,
        cursor,
      })
      if (page.ok && page.channels) {
        channels = [...channels, ...page.channels]
      } else {
        throw new Error(`Error querying slack channels: ${page.error ?? 'unknown error'}`)
      }
      cursor = page.response_metadata?.next_cursor
    } while (cursor)

    return channels.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
  }

  async getChannelName(channelId: string): Promise<string> {
    const response = await this.client.conversations.info({
      channel: channelId,
    })
    if (typeof response.channel?.name !== 'string') {
      throw new InvalidChannelIdError(channelId)
    }
    return response.channel.name
  }

  async postMessage(channelId: string, text: string): Promise<void> {
    const response = await this.client.chat.postMessage({
      channel: channelId,
      text,
    })
    if (!response.ok) {
      throw new SlackRequestFailedError(response.error)
    }
  }
}
