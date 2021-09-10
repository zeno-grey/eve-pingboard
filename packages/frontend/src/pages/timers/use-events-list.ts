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
}
export interface UseEventsListOptions {
  skip?: boolean
}
export function useEventsList({
  skip,
}: UseEventsListOptions = {}): UseEventsListResult {
  const dispatch = useAppDispatch()
  const events = useAppSelector(selectEvents)
  const loading = useAppSelector(selectIsLoadingEvents)
  const hasMoreEvents = useAppSelector(selectHasMoreEvents)

  const loadMore = () => dispatch(loadMoreEvents())
  const reload = () => dispatch(reloadEvents())

  useEffect(() => {
    if (skip !== true) {
      dispatch(reloadEvents())
    }
  }, [dispatch, skip])

  return {
    events,
    loading,
    hasMoreEvents,
    loadMoreEvents: loadMore,
    reloadEvents: reload,
  }
}
