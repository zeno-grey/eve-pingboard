import { ApiEventEntry, ApiEventEntryInput, UserRoles } from '@ping-board/common'
import { useMemo, useState } from 'react'
import { Button, Container } from 'react-bootstrap'
import { Redirect } from 'react-router-dom'
import {
  useAddEventMutation,
  useDeleteEventMutation,
  useGetEventsQuery,
  useGetUserQuery,
  useUpdateEventMutation,
} from '../../store'
import { EditEventDialog } from './edit-event-dialog'
import { EventsTable } from './events-table'
import './timers.scss'

export function TimersPage(): JSX.Element {
  const me = useGetUserQuery()

  const now = useMemo(() => new Date().toISOString(), [])
  const futureEvents = useGetEventsQuery({ after: now })
  const pastEvents = useGetEventsQuery({ before: now })
  const [addEvent] = useAddEventMutation()
  const [updateEvent] = useUpdateEventMutation()
  const [deleteEvent] = useDeleteEventMutation()

  const canEdit = me.data?.isLoggedIn && me.data.character.roles.includes(UserRoles.EVENTS_WRITE)

  const [eventDialogState, setEventDialogState] = useState({
    event: null as ApiEventEntry | null,
    show: false,
  })

  const editEvent = (event: ApiEventEntry) => setEventDialogState({ event, show: true })
  const addNewEvent = () => setEventDialogState({ event: null, show: true })
  const cancelEdit = () => setEventDialogState({ event: null, show: false })
  const confirmEditEvent = (event: ApiEventEntryInput) => {
    if (!eventDialogState.event) {
      addEvent(event)
    } else {
      updateEvent({ id: eventDialogState.event.id, event })
    }
    cancelEdit()
  }
  const deleteEditedEvent = () => {
    const { event } = eventDialogState
    if (!event) {
      return
    }
    deleteEvent(event.id)
    setEventDialogState({ event: null, show: false })
  }

  return (
    <Container fluid>
      {!me.isFetching && !me.data?.isLoggedIn && <Redirect to="/login"  />}

      <div className="timers-header">
        <h3>Active Timers</h3>
        <Button onClick={addNewEvent}>New Event</Button>
      </div>
      {futureEvents.isFetching && <span>Loading…</span> || (
        <EventsTable
          events={futureEvents.data?.events ?? []}
          canEdit={canEdit}
          onEdit={editEvent}
        />
      )}

      <h3>Expired Timers</h3>
      {pastEvents.isFetching && <span>Loading…</span> || (
        <EventsTable
          events={pastEvents.data?.events ?? []}
          showResultColumn
          canEdit={canEdit}
          onEdit={editEvent}
        />
      )}

      <EditEventDialog
        show={eventDialogState.show}
        event={eventDialogState.event}
        onCancel={cancelEdit}
        onSave={confirmEditEvent}
        onDelete={deleteEditedEvent}
      />
    </Container>
  )
}
