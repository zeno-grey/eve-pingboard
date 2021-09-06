import {
  ApiEventEntry,
  ApiEventEntryInput,
  ApiEventsResponse,
  ApiMeResponse,
} from '@ping-board/common'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react'

export const apiSlice = createApi({
  reducerPath: 'loginApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/', credentials: 'same-origin' }),
  tagTypes: ['User', 'Event'],
  endpoints: builder => ({
    /* User Management */
    getUser: builder.query<ApiMeResponse, void>({
      query: () => 'api/me',
      providesTags: ['User'],
    }),
    logOut: builder.mutation<void, void>({
      query: () => ({ url: 'auth/logout', method: 'POST' }),
      invalidatesTags: ['User', 'Event'],
    }),

    /* Events */
    getEvents: builder.query<ApiEventsResponse, GetEventsOptions>({
      query: params => ({ url: 'api/events', params }),
      providesTags: (result) => result && result.events.length > 0
        ? [...result.events.map(({ id }) => ({ type: 'Event' as const, id }))]
        : ['Event'],
    }),
    addEvent: builder.mutation<ApiEventEntry, ApiEventEntryInput>({
      query: event => ({ url: 'api/events', method: 'POST', body: event }),
      invalidatesTags: ['Event'],
    }),
    updateEvent: builder.mutation<ApiEventEntry, { id: number, event: ApiEventEntryInput }>({
      query: ({ id, event }) => ({ url: `api/events/${id}`, method: 'PUT', body: event }),
      invalidatesTags: ['Event'],
    }),
    deleteEvent: builder.mutation<void, number>({
      query: id => ({ url: `api/events/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, _, arg) => result ? [{ type: 'Event', id: arg }] : ['Event'],
    }),
  }),
})

export interface GetEventsOptions {
  before?: string
  after?: string
  count?: number
}

export const {
  useGetUserQuery,
  useLogOutMutation,
  useGetEventsQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = apiSlice
