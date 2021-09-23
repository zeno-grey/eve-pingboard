import clsx from 'clsx'
import { useState } from 'react'
import { Time } from '../../components/time'
import { CalendarEntry, getDisplayedMonthRange } from '../../store/calendar-slice'
import { dayjs, useDayjsLocale } from '../../utils/dayjs'
import { CalendarEntryDialog } from './calendar-entry-dialog'
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
interface CalendarProps {
  year: number
  month: number
  events: CalendarEntry[]
  className?: string
}
export function Calendar({
  year,
  month,
  events,
  className,
}: CalendarProps): JSX.Element {
  const { from, displayedWeeks } = getDisplayedMonthRange({ year, month })

  const [showEntryDialog, setShowEntryDialog] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null)
  const handleClickEntry = (entry: CalendarEntry) => {
    setShowEntryDialog(true)
    setSelectedEntry(entry)
  }
  const handleHideEntry = () => { setShowEntryDialog(false) }

  const weeks = [...new Array<void>(displayedWeeks)]
    .map((_, week) => ({
      week: from.add(week * 7, 'days').week(),
      days: [...new Array<void>(7)].map((_, day) => {
        const date = from.add(week * 7 + day, 'days')
        const start = date.valueOf()
        const end = date.add(1, 'days').valueOf()
        const isToday = date.format('YYYY-MM-DD') === dayjs.utc().format('YYYY-MM-DD')
        return {
          date,
          isToday,
          events: events.filter(e => {
            const t = dayjs.utc(e.dateTime).valueOf()
            return t >= start && t < end
          }).sort((a, b) => dayjs.utc(a.dateTime).valueOf() - dayjs.utc(b.dateTime).valueOf()),
        }
      }),
    }))

  // Update the component when the locale changes
  useDayjsLocale()

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
                    e.color ?? 'cyan',
                  )}
                  onClick={() => handleClickEntry(e)}
                >
                  <Time time={dayjs.utc(e.dateTime)} asLink format="HH:mm" className="me-1" />
                  <span>
                    <i className={{
                      event: 'bi-stopwatch',
                      ping: 'bi-broadcast-pin',
                    }[e.baseEntry.type]} />{' '}
                    {e.title}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <CalendarEntryDialog
        entry={selectedEntry}
        show={showEntryDialog}
        onHide={handleHideEntry}
        fullscreen="sm-down"
      />
    </div>
  )
}
