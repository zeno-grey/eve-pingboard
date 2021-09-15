import { ApiPing } from '@ping-board/common'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import {
  loadMorePings,
  reloadPings,
  selectHasMorePings,
  selectIsLoadingPings,
  selectPings,
} from '../../store/pings-list-slice'

export interface UsePingsListResult {
  pings: ApiPing[]
  loading: boolean
  hasMore: boolean
  loadMore: () => void
  reload: () => void
}
export interface UsePingsListOptions {
  skip?: boolean
}
export function usePingsList({
  skip,
}: UsePingsListOptions = {}): UsePingsListResult {
  const dispatch = useAppDispatch()
  const pings = useAppSelector(selectPings)
  const loading = useAppSelector(selectIsLoadingPings)
  const hasMore = useAppSelector(selectHasMorePings)

  const loadMore = () => dispatch(loadMorePings())
  const reload = () => dispatch(reloadPings())

  useEffect(() => {
    if (skip !== true) {
      dispatch(reloadPings())
    }
  }, [dispatch, skip])

  return {
    pings,
    loading,
    hasMore,
    loadMore,
    reload,
  }
}
