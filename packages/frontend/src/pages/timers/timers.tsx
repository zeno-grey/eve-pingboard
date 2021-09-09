import { ApiEventEntry, ApiEventEntryInput, UserRoles } from '@ping-board/common'
import { useEffect, useState } from 'react'
import { Button, Container } from 'react-bootstrap'
import { Redirect } from 'react-router-dom'
import {
  useAddEventMutation,
  useDeleteEventMutation,
  useGetUserQuery,
  useUpdateEventMutation,
} from '../../store'
import { EditEventDialog } from './edit-event-dialog'
import { EventsTable } from './events-table'
import './timers.scss'
import { useEventsList } from './use-events-list'

export function TimersPage(): JSX.Element {
  const me = useGetUserQuery()

  const eventsList = useEventsList()

  const [addEvent, addEventState] = useAddEventMutation()
  const [updateEvent, updateEventState] = useUpdateEventMutation()
  const [deleteEvent, deleteEventState] = useDeleteEventMutation()

  const [saveState, setSaveState] = useState<'add' | 'edit' | 'delete' | null>(null)
  const isSaving = !!saveState
  useEffect(() => {
    let state: (typeof addEventState) | (typeof updateEventState) | (typeof deleteEventState)
    switch (saveState) {
      case 'add':    state = addEventState; break
      case 'edit':   state = updateEventState; break
      case 'delete': state = deleteEventState; break
      default: return
    }
    if (!state.isLoading) {
      if (state.isError) {
        console.log('An Error occurred trying to', saveState, 'an event', state.error)
      }
      setSaveState(null)
    }
  }, [addEventState, deleteEventState, eventsList, saveState, updateEventState])

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
      setSaveState('add')
      addEvent(event)
    } else {
      setSaveState('edit')
      updateEvent({ id: eventDialogState.event.id, event })
    }
    cancelEdit()
  }
  const deleteEditedEvent = () => {
    const { event } = eventDialogState
    if (!event) {
      return
    }
    setSaveState('delete')
    deleteEvent(event.id)
    cancelEdit()
  }

  return (
    <Container fluid>
      {!me.isFetching && !me.data?.isLoggedIn && <Redirect to="/login"  />}

      <div className="timers-header">
        <h3>Timers</h3>
        <Button onClick={eventsList.reloadEvents} disabled={isSaving}>
          <i className="bi-arrow-clockwise" /> Reload
        </Button>
        <div style={{ flex: 1 }} />
        {canEdit &&
          <Button onClick={addNewEvent} disabled={isSaving}>
            <i className="bi-calendar-plus" /> New Event
          </Button>
        }
      </div>

      <EventsTable
        events={eventsList.events}
        showResultColumn
        canEdit={canEdit}
        onEdit={editEvent}
      />

      <Button
        style={{ width: '100%' }}
        disabled={!eventsList.hasMoreEvents || eventsList.loading || isSaving}
        onClick={eventsList.loadMoreEvents}
      >
        {eventsList.loading
          ? 'Loading…'
          : eventsList.hasMoreEvents
            ? 'Load more'
            : '(No more events)'
        }
      </Button>

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
