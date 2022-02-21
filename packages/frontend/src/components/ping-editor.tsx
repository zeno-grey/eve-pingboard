import { ChangeEventHandler, MouseEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { Alert, Col, Form, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { ApiPingTemplate } from '@ping-board/common'
import { Time } from './time'
import {
  AbsoluteOrRelativeTime,
  toAbsoluteTime,
} from '../hooks/use-absolute-relative-time-input'
import { useGetUserQuery } from '../store'
import { dayjs } from '../utils/dayjs'
import { PingTimeInput } from './ping-time-input'

export interface PingData {
  text: string
  calendarEntry?: {
    title: string
    time: AbsoluteOrRelativeTime
  }
}
export function deserializePing(serialized: string): PingData {
  const deserialized = JSON.parse(serialized) as unknown
  if (typeof deserialized !== 'object' || !deserialized) {
    throw new Error('Failed to deserialize ping: invalid type')
  }
  const text = (deserialized as { text?: unknown }).text
  if (typeof text !== 'string') {
    throw new Error('Failed to deserialize ping: title is not a string')
  }
  if (!('calendarEntry' in deserialized)) {
    return { text }
  }
  const entry = (deserialized as { calendarEntry: unknown }).calendarEntry
  if (typeof entry !== 'object' || !entry) {
    throw new Error('Failed to deserialize ping: calendarEntry is not an object')
  }
  const title = (entry as { title?: unknown }).title
  if (typeof title !== 'string') {
    throw new Error('Failed to deserialize ping: calendarEntry.title is not a string')
  }
  const time = (entry as { time?: unknown }).time
  if (typeof time !== 'object' || !time) {
    throw new Error('Failed to deserialize ping: calendarEntry.time is not an object')
  }
  if ('relative' in time) {
    const relative = (time as { relative?: unknown }).relative
    if (typeof relative !== 'string') {
      throw new Error('Failed to deserizlize ping: calendarEntry.time.relative is not a string')
    }
    return {
      text,
      calendarEntry: {
        title,
        time: { relative: dayjs.duration(relative) },
      },
    }
  } else if ('absolute' in time) {
    const absolute = (time as { absolute?: string }).absolute
    if (typeof absolute !== 'string') {
      throw new Error('Failed to deserizlize ping: calendarEntry.time.absolute is not a string')
    }
    return {
      text,
      calendarEntry: {
        title,
        time: { absolute: dayjs(absolute) },
      },
    }
  } else {
    throw new Error('Failed to deserialize ping: claendarEntry.time has an invalid format')
  }
}

export interface PingEditorProps {
  template: ApiPingTemplate | null
  ping: PingData
  onChange: (ping: PingData) => void
}
export function PingEditor({
  template,
  ping,
  onChange,
}: PingEditorProps): JSX.Element {
  const me = useGetUserQuery()

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const insertPlaceholderHandler = (placeholder: string) => (e: MouseEvent) => {
    e.preventDefault()
    if (!inputRef.current || !template) {
      return
    }
    const { selectionStart, selectionEnd } = inputRef.current
    const newText = [
      ping.text.substring(0, selectionStart),
      `{{${placeholder}}}`,
      ping.text.substring(selectionEnd),
    ].join('')
    onChange({ ...ping, text: newText })
    // Delay updating the selection to the next render
    setTimeout(() => {
      // + 4 because of the {{}}
      const newSelection = selectionStart + placeholder.length + 4
      inputRef.current?.setSelectionRange(newSelection, newSelection)
    })
  }

  const addToCalendar = !!ping.calendarEntry
  const [calendarEntryTitle, setCalendarEntryTitle] = useState(ping.calendarEntry?.title ?? '')
  const [calendarTime, setCalendarTime] = useState<AbsoluteOrRelativeTime>(
    ping.calendarEntry?.time ?? { relative: dayjs.duration(0) }
  )
  useEffect(() => {
    if (ping.calendarEntry?.time && calendarTime !== ping.calendarEntry?.time) {
      setCalendarTime(ping.calendarEntry.time)
    }
  }, [calendarTime, ping.calendarEntry?.time])

  const toggleAddToCalendar = () => {
    const add = !addToCalendar
    if (add) {
      onChange({ ...ping, calendarEntry: {
        time: calendarTime,
        title: calendarEntryTitle,
      }})
    } else {
      onChange({ text: ping.text })
    }
  }
  const handleCalendarEntryTitleChange: ChangeEventHandler<HTMLInputElement> = e => {
    const title = e.target.value
    setCalendarEntryTitle(title)
    if (addToCalendar) {
      onChange({ ...ping, calendarEntry: {
        time: calendarTime,
        title,
      }})
    }
  }
  const handleCalendarTimeChange = (newTime: AbsoluteOrRelativeTime) => {
    setCalendarTime(newTime)
    if (addToCalendar) {
      onChange({ ...ping, calendarEntry: {
        time: newTime,
        title: calendarEntryTitle,
      }})
    }
  }

  const name = me.data?.isLoggedIn && me.data.character.name
  const availablePlaceholders: { placeholder: string, description: ReactNode }[] = [
    ...template ? [
      {
        placeholder: 'me',
        description: `the name of the character you are logged in with (${name})`,
      },
    ] : [],
    ...template?.allowScheduling && addToCalendar ? [
      {
        placeholder: 'title',
        description: `the title of the calendar entry${
          calendarEntryTitle && ` (${calendarEntryTitle})`
        }`,
      },
      {
        placeholder: 'time',
        description: (<>
          a <a href="https://time.nakamura-labs.com/" target="_blank" rel="noreferrer">
            Nakamura time link
          </a> for the calendar entry&apos;s time and date
          (<Time time={toAbsoluteTime(calendarTime)} asLink format={'YYYY-MM-DD HH:mm'} />)
        </>),
      },
    ] : [],
  ]

  return (<>
    {/* <Col xs={12} md={8} className="pb-3 ping-column"> */}
      {!!template?.allowScheduling && (<>
        <Form.Group as={Col} controlId="schedule" xs={12} className="mb-3 pe-0">
          <Form.Label>Ping Options</Form.Label>
          <Form.Check
            checked={addToCalendar}
            onChange={toggleAddToCalendar}
            label="This is a pre-ping (select for more options)"
          />
        </Form.Group>

        {addToCalendar && (<>
          <Form.Group as={Col} controlid="calendarTitle" xs={12} className="mb-3 pe-0">
            <Form.Label>Calendar Entry Title</Form.Label>
            <Form.Control
              value={calendarEntryTitle}
              onChange={handleCalendarEntryTitleChange}
            />
          </Form.Group>

          <Row className="me-0">
            <Col xs={12} className="pe-0">
              <Form.Label>Calendar Time</Form.Label>
            </Col>

            <PingTimeInput time={calendarTime} onChange={handleCalendarTimeChange} />
          </Row>
        </>)}
      </>)}

      <Form.Group as={Col} xs={12} className="mb-3 pe-0 ping">
        {availablePlaceholders.length > 0 && (
          <Alert variant="info" className="py-1">
            <i className="bi-info-circle" />{' '}
            There are a few placeholders available that will be replaced when sending the ping:
            <ul className="mb-0">
              {availablePlaceholders.map(({ placeholder, description }) => (
                <li key={placeholder}>
                  <OverlayTrigger
                    placement="bottom"
                    delay={{ show: 250, hide: 0 }}
                    overlay={
                      <Tooltip>
                        Click to insert the placeholder at the cursor position
                      </Tooltip>
                    }
                  >
                    <code onMouseDown={insertPlaceholderHandler(placeholder)} role="button">
                      {`{{${placeholder}}}`}
                    </code>
                  </OverlayTrigger> → {description}
                </li>
              ))}
            </ul>
          </Alert>
        )}
        <Form.Label>Ping Text:</Form.Label>
        <Form.Control ref={inputRef}
          as="textarea"
          className="ping-text"
          disabled={!template}
          placeholder={template ? '' : 'Please select a channel first.'}
          value={template ? ping.text : ''}
          onChange={e => onChange({ ...ping, text: e.target.value })}
        />
      </Form.Group>
    {/* </Col> */}
  </>)
}
