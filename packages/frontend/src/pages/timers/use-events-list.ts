import { ApiEventEntry } from '@ping-board/common'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import {
  loadMoreEvents,
  reloadEvents,
  selectEvents,
  selectHasMoreEvents,
  selectIsLoadingEvents,
} from '../../store/events-list-slice'

export interface UseEventsListResult {
  events: ApiEventEntry[]
  loading: boolean
  hasMoreEvents: boolean
  loadMoreEvents: () => void
  reloadEvents: () => void
  // handleEventChanged: (event: ApiEventEntry) => void
  // handleEventDeleted: (eventId: number) => void
}
export function useEventsList(): UseEventsListResult {
  const dispatch = useAppDispatch()
  const events = useAppSelector(selectEvents)
  const loading = useAppSelector(selectIsLoadingEvents)
  const hasMoreEvents = useAppSelector(selectHasMoreEvents)

  const loadMore = () => dispatch(loadMoreEvents())
  const reload = () => dispatch(reloadEvents())

  useEffect(() => { dispatch(reloadEvents()) }, [dispatch])

  return {
    events,
    loading,
    hasMoreEvents,
    loadMoreEvents: loadMore,
    reloadEvents: reload,
  }
}
