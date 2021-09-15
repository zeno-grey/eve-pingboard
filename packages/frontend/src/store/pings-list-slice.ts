import { ApiPing, ApiPingsResponse } from '@ping-board/common'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'
import { apiSlice } from './api'

interface PingsListState {
  loading: boolean
  pings: ApiPing[]
  hasMore: boolean
}
const initialPingsListState: PingsListState = {
  loading: false,
  pings: [],
  hasMore: true,
}

export const reloadPings = createAsyncThunk(
  'pingsList/reloadPings',
  (_, { dispatch }) => {
    dispatch(clearPings())
    dispatch(loadMorePings())
  }
)

export const loadMorePings = createAsyncThunk(
  'pingsList/loadMore',
  async (_, { getState }) => {
    const pings = selectPings(getState() as RootState)
    const urlParams = new URLSearchParams(
      pings.length > 0 ? { before: pings[pings.length - 1].sentAt } : {}
    )
    const request = fetch(`/api/pings?${urlParams.toString()}`, { credentials: 'same-origin' })
    return await request.then(r => r.json()) as ApiPingsResponse
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { pingsList: PingsListState }
      return !state.pingsList.loading
    },
  }
)

function sortPings(pings: ApiPing[]): ApiPing[] {
  return [...pings].sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt))
}

export const pingsListSlice = createSlice({
  name: 'pingsList',
  initialState: initialPingsListState,
  reducers: {
    clearPings: state => {
      state.loading = false
      state.pings = []
      state.hasMore = true
    },
    pingsReceived: (state, action: PayloadAction<ApiPingsResponse>) => {
      state.loading = false
      state.pings = [...state.pings, ...action.payload.pings]
      state.hasMore = action.payload.remaining > 0
    },
  },
  extraReducers: builder => builder
    .addCase(loadMorePings.pending, state => { state.loading = true })
    .addCase(loadMorePings.fulfilled, (state, action) => {
      state.loading = false
      state.pings = sortPings([...state.pings, ...action.payload.pings])
      state.hasMore = action.payload.remaining > 0
    })
    .addCase(loadMorePings.rejected, state => {
      state.loading = false
    })
    .addMatcher(apiSlice.endpoints.addPing.matchFulfilled, (state, action) => {
      state.pings = sortPings([...state.pings, action.payload])
    }),
})

export const selectPings = (state: RootState): ApiPing[] => state.pingsList.pings
export const selectHasMorePings = (state: RootState): boolean => state.pingsList.hasMore
export const selectIsLoadingPings = (state: RootState): boolean => state.pingsList.loading

export const {
  clearPings,
  pingsReceived,
} = pingsListSlice.actions
