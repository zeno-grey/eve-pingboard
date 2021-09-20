import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/dist/query'
import { apiSlice } from './api'
import { calendarSlice } from './calendar-slice'
import { eventsListSlice } from './events-list-slice'
import { pingsListSlice } from './pings-list-slice'
export * from './api'

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [calendarSlice.name]: calendarSlice.reducer,
    [eventsListSlice.name]: eventsListSlice.reducer,
    [pingsListSlice.name]: pingsListSlice.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware()
    .concat(apiSlice.middleware),
})
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
