import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { Button, Container } from 'react-bootstrap'
import { Calendar, eventColors } from './calendar'

export function CalendarPage(): JSX.Element {
  const events = useMemo(() => [...new Array<void>(50)].map((_, i) => {
    const dateTime = new Date(Date.now() + (1000 * 60 * 60 * (Math.random() * 960 - 480)))
    return {
      title: `Test #${i}`,
      dateTime,
      color: eventColors[Math.floor(Math.random() * eventColors.length)],
    }
  }), [])

  const [currentMonth, setCurrentMonth] = useState(dayjs.utc())
  const handleTodayClicked = () => setCurrentMonth(dayjs.utc())
  const handleNextMonthClicked = () =>
    setCurrentMonth(m => m.add(dayjs.duration({ months: 1 })))
  const handlePrevMonthClicked = () =>
    setCurrentMonth(m => m.subtract(dayjs.duration({ months: 1 })))

  return (
    <Container fluid className="h-100 d-flex flex-column">
      <h3>Calendar</h3>
      <div className="d-flex mb-2">
        <Button size="sm" variant="outline-light" className="me-2" onClick={handleTodayClicked}>
          Today
        </Button>
        <Button size="sm" variant="outline-light" className="me-2" onClick={handlePrevMonthClicked}>
          <i className="bi-chevron-left" />
        </Button>
        <Button size="sm" variant="outline-light" className="me-2" onClick={handleNextMonthClicked}>
          <i className="bi-chevron-right" />
        </Button>
        <h4 className="h-100 mb-0 align-middle">{currentMonth.format('MMMM YYYY')}</h4>
      </div>
      <Calendar
        className="flex-fill mb-2"
        year={currentMonth.year()}
        month={currentMonth.month()}
        events={events}
      />
    </Container>
  )
}
