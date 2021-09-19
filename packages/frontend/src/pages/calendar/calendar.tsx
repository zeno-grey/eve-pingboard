import clsx from 'clsx'
import { dayjs } from '../../utils/dayjs'
import './calendar.scss'

export const eventColors = [
  'blue',
  'indigo',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'gray',
] as const
interface CalendarEvent {
  title: string
  dateTime: Date
  color: typeof eventColors[number]
}
interface CalendarProps {
  year: number
  month: number
  events: CalendarEvent[]
  className?: string
}
export function Calendar({
  year,
  month,
  events,
  className,
}: CalendarProps): JSX.Element {
  const from = dayjs.utc(`${year}-${month + 1}-01`)
  const fillerDaysBeforeMonth = from.day() - 1
  const totalDisplayedWeeks = Math.ceil((from.daysInMonth() + fillerDaysBeforeMonth) / 7)
  const weeks = [...new Array<void>(totalDisplayedWeeks)]
    .map((_, week) => ({
      week: from.add(week * 7, 'days').week(),
      days: [...new Array<void>(7)].map((_, day) => {
        const date = from.add(week * 7 + day - fillerDaysBeforeMonth, 'days')
        const start = date.valueOf()
        const end = date.add(1, 'days').valueOf()
        const isToday = date.format('YYYY-MM-DD') === dayjs.utc().format('YYYY-MM-DD')
        if (date.date() === 17) {
          console.log(date, start, end, events.map(e => e.dateTime.getTime()))
        }
        return {
          date,
          isToday,
          events: events.filter(e => {
            const t = e.dateTime.getTime()
            return t >= start && t < end
          }).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()),
        }
      }),
    }))

  return (
    <div className={clsx('d-flex', 'flex-column', 'bg-dark', className)}>
      {weeks.map((week, i) => (
        <div key={i}
          className={clsx(
            'flex-fill position-relative d-flex flex-grow-1',
            i > 0 && 'border-top',
          )}
        >
          {/* Week number */}
          <div className="py-1 mx-1" style={{ width: 28 }}>
            <div
              className="h-100 rounded-1 px-1 text-center"
              style={{ background: 'var(--bs-gray-700)' }}
            >
              {week.days[0].date.week()}
            </div>
          </div>
          {/* Days */}
          {week.days.map((day, j) => (
            <div key={day.date.date()}
              aria-hidden={true}
              className={clsx(
                'calendar-day',
                'flex-grow-1',
                'overflow-hidden',
                j > 0 && 'border-start',
                day.date.month() !== month && 'text-muted'
              )}
              style={{ flexBasis: 0 }}
            >
              {i === 0 &&
                // display the weekday in the first row of the calendar
                <div className="px-1 text-center text-white">
                  {day.date.format('dddd')}
                </div>
              }
              <div className={clsx('day', day.isToday && 'today')}>
                <span>{day.date.date()}</span>
              </div>
              {day.events.map((e, i) => (
                <div key={i}
                  className={clsx(
                    'calendar-event',
                    e.color,
                  )}
                >
                  <span className="me-1">
                    {dayjs.utc(e.dateTime).format('HH:mm')}
                  </span>
                  <span>{e.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
