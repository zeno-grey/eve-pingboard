import { Dayjs, dayjs } from '../utils/dayjs'

export interface TimeProps {
  time: Date | string | Dayjs
  format?: string
  asLink?: boolean
  className?: string
}
export function Time({
  time,
  format = 'llll',
  asLink = false,
  className,
}: TimeProps): JSX.Element {
  const t = dayjs(time)

  if (asLink) {
    const nakamuraLink = `https://time.nakamura-labs.com/#${t.unix()}`
    return (
      <a
        className={className}
        href={nakamuraLink}
        target="_blank"
        rel="noreferrer"
        onClick={e => e.stopPropagation()}
      >
        {t.format(format)}
      </a>
    )
  }

  return (
    <span className={className}>{t.format(format)}</span>
  )
}
