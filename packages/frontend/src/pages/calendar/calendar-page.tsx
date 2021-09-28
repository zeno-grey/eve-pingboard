import { UserRoles } from '@ping-board/common'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Button, Container } from 'react-bootstrap'
import { Redirect, useRouteMatch } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { useGetUserQuery } from '../../store'
import { clearCalendarEntries, loadMonth, selectCalendarEvents } from '../../store/calendar-slice'
import { Calendar } from './calendar'

export function CalendarPage(): JSX.Element {
  const dispatch = useAppDispatch()
  const me = useGetUserQuery()
  const canRead = me.data?.isLoggedIn && (
    me.data.character.roles.includes(UserRoles.EVENTS_READ) ||
    me.data.character.roles.includes(UserRoles.PING)
  )

  const events = useAppSelector(selectCalendarEvents)

  const [currentMonth, setCurrentMonth] = useState(dayjs.utc())
  const month = currentMonth.month()
  const year = currentMonth.year()
  useEffect(() => {
    dispatch(loadMonth({ month, year }))
  }, [dispatch, month, year])

  const handleTodayClicked = () => setCurrentMonth(dayjs.utc())
  const handleNextMonthClicked = () =>
    setCurrentMonth(m => m.add(dayjs.duration({ months: 1 })))
  const handlePrevMonthClicked = () =>
    setCurrentMonth(m => m.subtract(dayjs.duration({ months: 1 })))
  const handleReloadClicked = () => {
    dispatch(clearCalendarEntries())
    dispatch(loadMonth({ month, year }))
  }

  const { url } = useRouteMatch()
  if (!me.isFetching) {
    if (!me.data?.isLoggedIn) {
      return <Redirect to={`/login?postLoginRedirect=${url}`} />
    }
    if (!canRead) {
      return (
        <Container fluid>
          <h6>Sorry, you don&apos;t have permission to view this page.</h6>
        </Container>
      )
    }
  }

  return (
    <Container fluid className="h-100 d-flex flex-column">
      <h3 className="mt-n1 pt-3">Calendar</h3>
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
        <h4 className="h-100 mb-0 me-2 align-middle">{currentMonth.format('MMMM YYYY')}</h4>
        <Button size="sm" variant="outline-light" onClick={handleReloadClicked}>
          <i className="bi-arrow-clockwise" /> Reload
        </Button>
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
