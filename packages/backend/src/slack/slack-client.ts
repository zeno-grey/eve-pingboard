import { LogLevel, WebClient } from '@slack/web-api'

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
