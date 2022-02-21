import { useEffect, useState } from 'react'
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

export type AbsoluteOrRelativeTime =
  | { absolute: Dayjs }
  | { relative: Duration }

export interface UseAbsoluteRelativeTimeInputOptions {
  allowPast?: boolean
  time: AbsoluteOrRelativeTime
  onChange: (newValue: AbsoluteOrRelativeTime) => void
}

export function useAbsoluteRelativeTimeInput({
  allowPast = true,
  time,
  onChange,
}: UseAbsoluteRelativeTimeInputOptions): UseAbsoluteRelativeTimeInputReturn {
  const handleChangeInputMode = (mode: TimeInputMode) => {
    if (mode === 'absolute' && 'relative' in time) {
      onChange({ absolute: dayjs().add(time.relative).utc() })
    } else if (mode === 'relative' && 'absolute' in time) {
      onChange({ relative: dayjs.duration(time.absolute.diff(dayjs())) })
    }
  }
  const handleAbsoluteDateChange = (absolute: Dayjs) => onChange({
    absolute: !allowPast && absolute.isBefore(dayjs()) ? dayjs() : absolute,
  })
  const handleRelativeDateChange = (relative: Duration) => onChange({
    relative: !allowPast && relative.asMilliseconds() < 0 ? dayjs.duration(0) : relative,
  })

  const inputMode: TimeInputMode = 'absolute' in time ? 'absolute' : 'relative'

  const [times, setTimes] = useState(calculateTimes(time))
  useEffect(() => {
    const updateTimes = () => setTimes(calculateTimes(time))
    const interval = setInterval(updateTimes, 1000)
    updateTimes()
    return () => clearInterval(interval)
  }, [time])

  return {
    handleChangeInputMode,
    handleAbsoluteDateChange,
    handleRelativeDateChange,
    inputMode,
    ...times,
  }
}

export function toAbsoluteTime(time: AbsoluteOrRelativeTime): Dayjs {
  return 'absolute' in time ? time.absolute : dayjs().add(time.relative).utc()
}
export function toRelativeTime(time: AbsoluteOrRelativeTime): Duration {
  return 'relative' in time ? time.relative : dayjs.duration(time.absolute.diff(dayjs()))
}

function calculateTimes(time: AbsoluteOrRelativeTime): {
  absoluteTime: Dayjs
  relativeTime: Duration
} {
  return {
    absoluteTime: toAbsoluteTime(time),
    relativeTime: toRelativeTime(time),
  }
}
