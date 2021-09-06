import { useMemo } from 'react'
import { Container } from 'react-bootstrap'
import { Redirect } from 'react-router-dom'
import { useGetEventsQuery, useGetUserQuery } from '../../store'
import { EventsTable } from './events-table'

export function TimersPage(): JSX.Element {
  const me = useGetUserQuery()

  const now = useMemo(() => new Date().toISOString(), [])
  const futureEvents = useGetEventsQuery({ after: now })
  const pastEvents = useGetEventsQuery({ before: now })

  return (
    <Container fluid>
      {!me.isFetching && !me.data?.isLoggedIn && <Redirect to="/login"  />}

      <h3>Active Timers</h3>
      {futureEvents.isFetching && <span>Loading…</span> || (
        <EventsTable events={futureEvents.data?.events ?? []} />
      )}

      <h3>Expired Timers</h3>
      {pastEvents.isFetching && <span>Loading…</span> || (
        <EventsTable events={pastEvents.data?.events ?? []} showResultColumn />
      )}
    </Container>
  )
}
