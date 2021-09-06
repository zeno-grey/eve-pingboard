import * as uuid from 'uuid'
import { Session, SessionProvider } from '../middleware/session'
import { createIntervalScheduler } from './create-interval-scheduler'

export class InMemorySessionProvider implements SessionProvider {
  private readonly sessionStore = new Map<string, Session>()
  private readonly cleanupScheduler = createIntervalScheduler(() => this.cleanup())

  async createSession(data: Omit<Session, 'id'>): Promise<Readonly<Session>> {
    const id = uuid.v4()
    const session = { id, ...data }
    this.sessionStore.set(id, session)
    return session
  }

  async updateSession(session: Session): Promise<void> {
    if (!this.sessionStore.has(session.id)) {
      throw new Error('Invalid session ID')
    }
    this.sessionStore.set(session.id, session)
  }

  async getSession(sessionId: string): Promise<Readonly<Session> | null> {
    const session = this.sessionStore.get(sessionId)
    if (!session || session.expiresAt.getTime() < Date.now()) {
      return null
    }
    return session
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessionStore.delete(sessionId)
  }

  /**
   * Starts regularly checking for and removing expired sessions.
   * @param cleanupInterval the time between checks, in seconds
   */
  startAutoCleanup(cleanupInterval = 300): void {
    this.cleanupScheduler.start(cleanupInterval * 1000)
  }
  /** Stops regularly checking for expired sessions. */
  stopAutoCleanup(): void {
    this.cleanupScheduler.stop()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [sessionId, { expiresAt }] of this.sessionStore) {
      if (expiresAt.getTime() < now) {
        this.sessionStore.delete(sessionId)
      }
    }
  }
}
