import { Dayjs, dayjs } from '../utils/dayjs'

export interface TimeProps {
  time: Date | string | Dayjs
  format?: string
  asLink?: boolean
}
export function Time({
  time,
  format = 'llll',
  asLink = false,
}: TimeProps): JSX.Element {
  const t = dayjs(time)

  if (asLink) {
    const nakamuraLink = `https://time.nakamura-labs.com/#${t.unix()}`
    return (
      <a href={nakamuraLink} target="_blank" rel="noreferrer">{t.format(format)}</a>
    )
  }

  return (
    <span>{t.format(format)}</span>
  )
}
