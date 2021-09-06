import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export interface RelativeTimeProps {
  time: Date | string
}
export function RelativeTime({
  time,
}: RelativeTimeProps): JSX.Element {
  const [relative, setRelative] = useState(dayjs(time).fromNow())
  useEffect(() => {
    const interval = setInterval(() => setRelative(dayjs(time).fromNow()))
    return () => clearInterval(interval)
  }, [time])

  return (
    <span>{relative}</span>
  )
}
