import { useCallback, useEffect, useState } from 'react'
import { dayjs, Dayjs, Duration } from '../utils/dayjs'

export type TimeInputMode = 'absolute' | 'relative'
export interface UseAbsoluteRelativeTimeInputReturn {
  absoluteTime: Dayjs
  relativeTime: Duration

  handleChangeInputMode: (mode: TimeInputMode) => void
  inputMode: TimeInputMode

  handleAbsoluteDateChange: (date: Dayjs) => void
  handleRelativeDateChange: (relative: Duration) => void
}

type AbsoluteOrRelativeTime =
  | { absolute: Dayjs }
  | { relative: Duration }

export interface UseAbsoluteRelativeTimeInputOptions {
  time: AbsoluteOrRelativeTime
}

export function useAbsoluteRelativeTimeInput({
  time: initialTime,
}: UseAbsoluteRelativeTimeInputOptions): UseAbsoluteRelativeTimeInputReturn {
  const [time, setTime] = useState(initialTime)

  const handleChangeInputMode = useCallback((mode: TimeInputMode) => {
    setTime(time => {
      if (mode === 'absolute' && 'relative' in time) {
        return { absolute: dayjs().add(time.relative).utc() }
      } else if (mode === 'relative' && 'absolute' in time) {
        return { relative: dayjs.duration(time.absolute.diff(dayjs())) }
      }
      return time
    })
  }, [])

  const handleAbsoluteDateChange = useCallback((absolute: Dayjs) => setTime({ absolute }), [])
  const handleRelativeDateChange = useCallback((relative: Duration) => setTime({ relative }), [])

  const [times, setTimes] = useState(calculateTimes(time))
  useEffect(() => {
    const updateTimes = () => setTimes(calculateTimes(time))
    const interval = setInterval(updateTimes, 1000)
    updateTimes()
    return () => clearInterval(interval)
  }, [time])

  return {
    ...times,
    handleChangeInputMode,
    inputMode: 'absolute' in time ? 'absolute' : 'relative',
    handleAbsoluteDateChange,
    handleRelativeDateChange,
  }
}

function calculateTimes(time: AbsoluteOrRelativeTime): {
  absoluteTime: Dayjs
  relativeTime: Duration
} {
  return {
    absoluteTime: 'absolute' in time ? time.absolute : dayjs().add(time.relative).utc(),
    relativeTime: 'relative' in time ? time.relative : dayjs.duration(time.absolute.diff(dayjs())),
  }
}
