import {
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
} = apiSlice
