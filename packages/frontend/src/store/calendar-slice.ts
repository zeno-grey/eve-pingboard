import { ApiEventEntry, ApiEventsResponse } from '@ping-board/common'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '.'
import { eventColors } from '../pages/calendar/calendar'
import { Dayjs, dayjs } from '../utils/dayjs'
import { apiSlice } from './api'

export interface CalendarEntry {
  title: string
  dateTime: string
  color?: typeof eventColors[number]
  baseEntry:
    | { type: 'event', event: ApiEventEntry }
    | { type: 'ping', ping: null }
}

interface CalendarState {
  loadingMonths: string[]
  loadedMonths: string[]
  events: CalendarEntry[]
}
const initialCalendarState: CalendarState = {
  loadingMonths: [],
  loadedMonths: [],
  events: [],
}

const dayjsFromYearAndMonth = (date: { year: number, month: number }) =>
  // We need to month+1, because month numbers are 0-based (i.e. january = 0)
  dayjs.utc(`${date.year}-${date.month + 1}-01`)

const getMonthKey = (date: { year: number, month: number }) =>
  dayjsFromYearAndMonth(date).format('YYYY-MM')

function modulo(a: number, mod: number): number {
  return ((a % mod) + mod) % mod
}

export function getDisplayedMonthRange(date: { year: number, month: number }): {
  from: Dayjs
  to: Dayjs
  displayedWeeks: number
} {
  const firstOfMonth = dayjsFromYearAndMonth(date)
  const startOfMonthPadding = modulo(firstOfMonth.day() - dayjs.localeData().firstDayOfWeek(), 7)
  const from = firstOfMonth.subtract(dayjs.duration({ days: startOfMonthPadding }))
  const displayedWeeks = Math.ceil((from.daysInMonth() + startOfMonthPadding) / 7)
  const to = from.add(dayjs.duration({ weeks: displayedWeeks }))
  return { from, to, displayedWeeks }
}

export const loadMonth = createAsyncThunk(
  'calendar/loadMonth',
  async (args: { year: number, month: number }) => {
    const { from, to } = getDisplayedMonthRange(args)

    let events: ApiEventEntry[] = []
    let hasMore = true
    // Load all pages for the given time frame
    while (hasMore) {
      const urlParams = new URLSearchParams({
        ...events.length > 0
          ? { after: events[events.length - 1].time }
          : { after: from.toISOString() },
        before: to.toISOString(),
        count: '40',
      })
      const response = await fetch(
        `/api/events?${urlParams.toString()}`,
        { credentials: 'same-origin' }
      ).then(r => r.json()) as ApiEventsResponse
      events = [...events, ...response.events]
      hasMore = response.remaining > 0
    }
    return { cached: false, events }
  },
  {
    condition: (args, { getState }) => {
      const monthKey = getMonthKey(args)
      const { loadingMonths, loadedMonths } = (getState() as { calendar: CalendarState }).calendar
      return !loadingMonths.includes(monthKey) && !loadedMonths.includes(monthKey)
    },
  }
)

export const calendarSlice = createSlice({
  name: 'calendar',
  initialState: initialCalendarState,
  reducers: {
    clearCalendarEntries: state => {
      state.events = []
      state.loadedMonths = []
    },
  },
  extraReducers: builder => builder
    .addCase(loadMonth.pending, (state, action) => {
      state.loadingMonths.push(getMonthKey(action.meta.arg))
    })
    .addCase(loadMonth.rejected, (state, action) => {
      const monthKey = getMonthKey(action.meta.arg)
      state.loadingMonths = state.loadingMonths.filter(m => m !== monthKey)
    })
    .addCase(loadMonth.fulfilled, (state, action) => {
      const monthKey = getMonthKey(action.meta.arg)
      state.loadingMonths = state.loadingMonths.filter(m => m !== monthKey)
      if (!action.payload) {
        return
      }
      for (const e of action.payload.events) {
        state.events.push(calendarEntryFromEvent(e))
      }
      state.loadedMonths.push(monthKey)
    })

    // Clear state on logout to prevent leaking data that the new user should not be able to see
    .addMatcher(apiSlice.endpoints.logOut.matchFulfilled, () => {
      return initialCalendarState
    })

    // Add calendar entries for every added event
    .addMatcher(apiSlice.endpoints.addEvent.matchFulfilled, (state, action) => {
      state.events = [...state.events, calendarEntryFromEvent(action.payload)]
    })
    // Update calendar entries for every updated event
    .addMatcher(apiSlice.endpoints.updateEvent.matchFulfilled, (state, action) => {
      const updated = action.payload
      state.events = state.events.map(e =>
        e.baseEntry.type === 'event' &&
        e.baseEntry.event.id === updated.id
        ? calendarEntryFromEvent(updated)
        : e
      )
    })
    // Remove calendar entries for every removed event
    .addMatcher(apiSlice.endpoints.deleteEvent.matchFulfilled, (state, action) => {
      const eventId = action.meta.arg.originalArgs
      state.events = state.events
        .filter(e => e.baseEntry.type !== 'event' || e.baseEntry.event.id !== eventId)
    })
    ,
})

function calendarEntryFromEvent(event: ApiEventEntry): CalendarEntry {
  let color: CalendarEntry['color']
  switch (event.priority.toLowerCase()) {
    case 'low': color = 'gray'; break
    case 'medium': color = 'yellow'; break
    case 'high': color = 'orange'; break
    case 'critical': color = 'red'; break
  }

  const title = [
    event.standing.charAt(0).toUpperCase(),
    event.standing.substr(1),
    ' ',
    event.structure.toLowerCase() === 'other' ? '' : event.structure + ' ',
    event.type.toLowerCase() === 'other' ? '' : event.type.toLowerCase() + ' ',
    'timer in ',
    event.system,
  ].join('')

  return {
    dateTime: event.time,
    title,
    color,
    baseEntry: { type: 'event', event },
  }
}

export const selectCalendarEvents = (state: RootState): CalendarEntry[] => state.calendar.events
export const selectIsLoadingCalendarEvents = (state: RootState): boolean =>
  state.calendar.loadingMonths.length > 0
