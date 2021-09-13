import {
  ApiEventEntry,
  ApiEventEntryInput,
  ApiEventsResponse,
  ApiMeResponse,
  ApiNeucoreGroupsResponse,
  ApiPingInput,
  ApiPingTemplate,
  ApiPingTemplateInput,
  ApiPingTemplatesResponse,
  ApiSlackChannelsResponse,
} from '@ping-board/common'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react'

export const apiSlice = createApi({
  reducerPath: 'loginApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/', credentials: 'same-origin' }),
  tagTypes: ['User', 'Event', 'PingTemplate', 'PingChannel', 'NeucoreGroup'],
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

    /* Pings */
    postPing: builder.mutation<void, ApiPingInput>({
      query: ping => ({ url: 'api/pings', method: 'POST', body: ping }),
    }),
    getPingChannels: builder.query<ApiSlackChannelsResponse, void>({
      query: () => ({ url: 'api/pings/channels' }),
      providesTags: result => result && result.channels.length > 0
        ? [...result.channels.map(({ id }) => ({ type: 'PingChannel' as const, id }))]
        : ['PingChannel'],
    }),
    getAvailableNeucoreGroups: builder.query<ApiNeucoreGroupsResponse, void>({
      query: () => ({ url: 'api/pings/neucore-groups' }),
      providesTags: result => result && result.neucoreGroups.length > 0
        ? [...result.neucoreGroups.map(({ id }) => ({ type: 'NeucoreGroup' as const, id }))]
        : ['NeucoreGroup'],
    }),
    getPingTemplates: builder.query<ApiPingTemplatesResponse, void>({
      query: () => ({ url: 'api/pings/templates' }),
      providesTags: (result) => result && result.templates.length > 0
        ? [...result.templates.map(({ id }) => ({ type: 'PingTemplate' as const, id }))]
        : ['PingTemplate'],
    }),
    addPingTemplate: builder.mutation<ApiPingTemplate, ApiPingTemplateInput>({
      query: template => ({ url: 'api/pings/templates', method: 'POST', body: template }),
      invalidatesTags: ['PingTemplate'],
    }),
    updatePingTemplate: builder
      .mutation<ApiPingTemplate, { id: number, template: ApiPingTemplateInput }>({
        query: ({ id, template }) => ({
          url: `api/pings/templates/${id}`,
          method: 'PUT',
          body: template,
        }),
        invalidatesTags: result =>
          result ? [{ type: 'PingTemplate', id: result.id }] : ['PingTemplate'],
    }),
    deletePingTemplate: builder.mutation<void, number>({
      query: id => ({ url: `api/pings/templates/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, _, arg) =>
        result ? [{ type: 'PingTemplate', id: arg }] : ['PingTemplate'],
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

  usePostPingMutation,
  useGetPingChannelsQuery,
  useGetAvailableNeucoreGroupsQuery,
  useGetPingTemplatesQuery,
  useAddPingTemplateMutation,
  useUpdatePingTemplateMutation,
  useDeletePingTemplateMutation,
} = apiSlice
