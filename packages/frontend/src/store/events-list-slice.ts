import { ApiEventEntry, ApiEventsResponse } from '@ping-board/common'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'
import { apiSlice } from './api'

interface EventsListState {
  loading: boolean
  events: ApiEventEntry[]
  hasMoreEvents: boolean
}
const initialEventsListState: EventsListState = {
  loading: false,
  events: [],
  hasMoreEvents: true,
}

export const reloadEvents = createAsyncThunk(
  'eventsList/reloadEvents',
  (_, { dispatch }) => {
    dispatch(clearEvents())
    dispatch(loadMoreEvents())
  }
)

export const loadMoreEvents = createAsyncThunk(
  'eventsList/loadMore',
  async (_, { getState }) => {
    const events = selectEvents(getState() as RootState)
    const urlParams = new URLSearchParams({
      ...events.length > 0 ? { before: events[events.length - 1].time } : {},
      count: '40',
    })
    const request = fetch(`/api/events?${urlParams.toString()}`, { credentials: 'same-origin' })
    return await request.then(r => r.json()) as ApiEventsResponse
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { eventsList: EventsListState }
      return !state.eventsList.loading
    },
  }
)

function sortEvents(events: ApiEventEntry[]): ApiEventEntry[] {
  return [...events].sort((a, b) => Date.parse(b.time) - Date.parse(a.time))
}

export const eventsListSlice = createSlice({
  name: 'eventsList',
  initialState: initialEventsListState,
  reducers: {
    clearEvents: state => {
      state.loading = false
      state.events = []
      state.hasMoreEvents = true
    },
    eventsReceived: (state, action: PayloadAction<ApiEventsResponse>) => {
      state.loading = false
      state.events = [...state.events, ...action.payload.events]
      state.hasMoreEvents = action.payload.remaining > 0
    },
  },
  extraReducers: builder => builder
    .addCase(loadMoreEvents.pending, state => { state.loading = true })
    .addCase(loadMoreEvents.fulfilled, (state, action) => {
      state.loading = false
      state.events = sortEvents([...state.events, ...action.payload.events])
      state.hasMoreEvents = action.payload.remaining > 0
    })
    .addCase(loadMoreEvents.rejected, state => {
      state.loading = false
    })
    .addMatcher(apiSlice.endpoints.addEvent.matchFulfilled, (state, action) => {
      state.events = sortEvents([...state.events, action.payload])
    })
    .addMatcher(apiSlice.endpoints.updateEvent.matchFulfilled, (state, action) => {
      const updated = action.payload
      state.events = sortEvents(state.events.map(e => e.id === updated.id ? updated : e))
    })
    .addMatcher(apiSlice.endpoints.deleteEvent.matchFulfilled, (state, action) => {
      const eventId = action.meta.arg.originalArgs
      state.events = state.events.filter(e => e.id !== eventId)
    }),
})

export const selectEvents = (state: RootState): ApiEventEntry[] => state.eventsList.events
export const selectHasMoreEvents = (state: RootState): boolean => state.eventsList.hasMoreEvents
export const selectIsLoadingEvents = (state: RootState): boolean => state.eventsList.loading

export const {
  clearEvents,
  eventsReceived,
} = eventsListSlice.actions
