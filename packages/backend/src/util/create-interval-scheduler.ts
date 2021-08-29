export interface IntervalScheduler {
  start(interval: number, runImmediately?: boolean): void
  stop(): void
}

export function createIntervalScheduler(callback: () => void): IntervalScheduler {
  let interval: NodeJS.Timeout | null = null
  function stop() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }
  function start(int: number, runImmediately = false) {
    stop()
    interval = setInterval(callback, int)
    if (runImmediately) {
      callback()
    }
  }

  return { start, stop }
}
