import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
dayjs.extend(duration)
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.extend(utc)

export { dayjs }
export type { Dayjs } from 'dayjs'
export type { Duration, DurationUnitsObjectType } from 'dayjs/plugin/duration'
