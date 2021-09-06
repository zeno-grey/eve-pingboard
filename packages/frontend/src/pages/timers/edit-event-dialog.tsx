import { ApiEventEntry, ApiEventEntryInput } from '@ping-board/common'
import clsx from 'clsx'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { DateTimeInput } from '../../components/date-time-input'
import { RelativeTimeInput } from '../../components/relative-time-input'
import { Dayjs, dayjs, Duration } from '../../utils/dayjs'
import './edit-event-dialog.scss'

interface EditedEvent extends Omit<ApiEventEntryInput, 'time'> {
  time: { relative: Duration } | { fixed: Dayjs }
}

const priorities = ['Low', 'Medium', 'High', 'Critical']
const structureTypes: [value: string, title: string][] = [
  ['TCU', 'TCU'],
  ['IHub', 'IHub'],
  ['POS', 'POS'],
  ['POCO', 'POCO'],
  ['Raitaru', 'Raitaru'],
  ['Azbel', 'Azbel'],
  ['Sotiyo', 'Sotiyo'],
  ['Athanor', 'Athanor'],
  ['Tatara', 'Tatara'],
  ['Astrahus', 'Astrahus'],
  ['Fortizar', 'Fortizar'],
  ['Keepstar', 'Keepstar'],
  ['Pharolynx', 'Pharolynx Cyno Beacon'],
  ['Tenebrex', 'Tenebrex Cyno Jammer'],
  ['Ansiblex', 'Ansiblex Jump Gate'],
  ['other', 'other'],
]
const eventTypes = ['Anchoring', 'Shield', 'Armor', 'Structure', 'other']
const standings = ['friendly', 'enemy', 'neutral', 'other']
const result = ['No data', 'Win', 'Loss']

export interface EditEventDialogProps {
  show: boolean
  event?: ApiEventEntry | null
  onSave?: (event: ApiEventEntryInput) => void
  onCancel?: () => void
  onDelete?: () => void
}
export function EditEventDialog({
  show,
  event,
  onSave,
  onCancel,
  onDelete,
}: EditEventDialogProps): JSX.Element {
  const [editedEvent, setEditedEvent] = useState<EditedEvent>(getDefaultEditedEvent())
  useEffect(() => setEditedEvent(event
    ? { ...event, time: { fixed: dayjs(event.time).utc() } }
    : getDefaultEditedEvent()
  ), [event])

  const canSave = Object.entries(editedEvent ?? {}).every(([k, v]) => k === 'notes' || !!v)
  const save = () => {
    if (canSave && onSave) {
      onSave({
        ...editedEvent,
        time: 'fixed' in editedEvent.time
          ? editedEvent.time.fixed.toISOString()
          : dayjs().add(editedEvent.time.relative).utc().toISOString(),
      })
    }
  }

  const calculateTimes = useCallback((time: EditedEvent['time']) => {
    if ('fixed' in time) {
      return {
        absolute: time.fixed,
        relative: dayjs.duration(time.fixed.diff(dayjs())),
      }
    } else {
      return {
        absolute: dayjs().add(time.relative).utc(),
        relative: time.relative,
      }
    }
  }, [])
  const [times, setTimes] = useState<ReturnType<typeof calculateTimes>>(
    () => calculateTimes(editedEvent.time)
  )
  useEffect(() => {
    const interval = setInterval(() => setTimes(calculateTimes(editedEvent.time)), 1000)
    setTimes(calculateTimes(editedEvent.time))
    return () => clearInterval(interval)
  }, [calculateTimes, editedEvent.time])

  const isNewEvent = typeof event?.id !== 'number'
  const lastEdited = !isNewEvent && [
    `Last edited by ${event?.updatedBy ?? 'unknown'}`,
    event?.updatedAt
      ? `at ${dayjs(event.updatedAt).format('llll')} (${dayjs(event.updatedAt).fromNow()})`
      : 'unknown',
  ].join(' ')
  const usesAbsoluteTime = 'fixed' in editedEvent.time

  const handleChangeTimeMode = (mode: 'absolute' | 'relative') => {
    const { time } = editedEvent
    if (mode === 'absolute' && 'relative' in time) {
      setEditedEvent(e => ({ ...e, time: { fixed: dayjs().add(time.relative).utc() } }))
    } else  if (mode === 'relative' && 'fixed' in time) {
      setEditedEvent(e => ({ ...e, time: { relative: dayjs.duration(time.fixed.diff(dayjs())) } }))
    }
  }

  const handleAbsoluteDateChange = (fixed: Dayjs) => {
    setEditedEvent(e => ({ ...e, time: { fixed }}))
  }

  const handleRelativeDateChange = (relative: Duration) => {
    setEditedEvent(e => ({ ...e, time: { relative }}))
  }

  const setEventField = <T extends keyof EditedEvent>(field: T, value: EditedEvent[T]) => {
    setEditedEvent(e => ({ ...e, [field]: value }))
  }

  type ValueKeys<T, V> = { [K in keyof T]: T[K] extends V ? T[K] : never }
  const handleSelectValueChange = <T extends keyof ValueKeys<EditedEvent, string>>(field: T) =>
    (e: ChangeEvent<HTMLSelectElement>) => setEventField(field, e.target.value as EditedEvent[T])

  const [isDeletePending, setIsDeletePending] = useState(false)
  const handleStartDelete = () => setIsDeletePending(true)
  const handleCancelDelete = () => setIsDeletePending(false)
  const handleConfirmDelete = () => onDelete?.()

  return (
    <Modal show={show} size="lg" backdrop="static">
      <Modal.Header>
        <Modal.Title>{isNewEvent ? 'Add' : 'Edit'} Event</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            {lastEdited && <Col xs={12} className="mb-3">{lastEdited}</Col>}

            <Form.Group as={Col} controlId="solarSystem" xs={12} sm={6} className="mb-3">
              <Form.Label>Solar System</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. NBPH-N"
                value={editedEvent.system}
                onChange={e => setEventField('system', e.target.value)}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="priority" xs={12} sm={6} className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={editedEvent?.priority ?? ''}
                onChange={handleSelectValueChange('priority')}
              >
                <option value="">(Please Select)</option>
                {priorities.map(prio => (
                  <option key={prio} value={prio}>
                    {prio}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} controlId="structure" xs={12} sm={6} className="mb-3">
              <Form.Label>Structure</Form.Label>
              <Form.Select
                value={editedEvent?.structure ?? ''}
                onChange={handleSelectValueChange('structure')}
              >
                <option value="">(Please Select)</option>
                {structureTypes.map(([value, title]) => (
                  <option key={value} value={value}>
                    {title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} controlId="type" xs={12} sm={6} className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={editedEvent?.type ?? ''}
                onChange={handleSelectValueChange('type')}
              >
                <option value="">(Please Select)</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} controlId="standing" xs={12} sm={6} className="mb-3">
              <Form.Label>Standing</Form.Label>
              <Form.Select
                value={editedEvent?.standing ?? ''}
                onChange={handleSelectValueChange('standing')}
              >
                <option value="">(Please Select)</option>
                {standings.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} controlId="result" xs={12} sm={6} className="mb-3">
              <Form.Label>Result</Form.Label>
              <Form.Select
                value={editedEvent?.result ?? 'No data'}
                onChange={handleSelectValueChange('result')}
              >
                {result.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Col xs={12}>
              <Form.Label>Event Time</Form.Label>
            </Col>

            <Form.Group as={Col} controlId="eveDateTime" xs={12} lg={6}>
              <Form.Label>
                <Form.Check
                  inline
                  label="Use EVE Date and Time"
                  name="eveDateTimeMode"
                  type="radio"
                  onChange={() => handleChangeTimeMode('absolute')}
                  id="absolute"
                  checked={usesAbsoluteTime}
                />
              </Form.Label>
              <DateTimeInput
                value={times.absolute}
                onChange={handleAbsoluteDateChange}
                className={clsx('time-mode-input', !usesAbsoluteTime && 'inactive-time-mode')}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="relativeTime" xs={12} lg={6}>
              <Form.Label>
                <Form.Check
                  inline
                  label="Use Relative Time"
                  name="eveDateTimeMode"
                  type="radio"
                  onChange={() => handleChangeTimeMode('relative')}
                  id="relative"
                  checked={!usesAbsoluteTime}
                />
              </Form.Label>
              <RelativeTimeInput
                value={times.relative}
                onChange={handleRelativeDateChange}
                className={clsx('time-mode-input', usesAbsoluteTime && 'inactive-time-mode')}
              />
            </Form.Group>

            {/*
              Show a horizontal divider on smaller screens (≤ md) to make it more obvious that
              the inputs below are not affected by the absolute/relative time radio buttons
            */}
            <Col xs={12} className="d-block d-lg-none">
              <hr />
            </Col>

            <Form.Group as={Col} controlId="notes" xs={12} className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                value={editedEvent?.notes ?? ''}
                onChange={e => setEventField('notes', e.target.value)}
              />
            </Form.Group>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer className="edit-timer-dialog-footer">
        <div className={clsx('edit-timer-dialog-buttons-wrapper', isDeletePending && 'hidden')}>
          {!isNewEvent && (
            <>
              <Button
                variant="danger"
                disabled={isDeletePending}
                onClick={handleStartDelete}
              >
                Delete
              </Button>
              <div className="edit-timer-dialog-buttons-spacer" />
            </>
          )}
          <Button variant="secondary" onClick={onCancel} disabled={isDeletePending}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!canSave || isDeletePending} onClick={save}>
            Save
          </Button>
        </div>
        {!isNewEvent && (
          <div className={clsx(
            'edit-timer-confirm-delete-buttons-wrapper',
            !isDeletePending && 'hidden'
          )}>
            <Button disabled={!isDeletePending} onClick={handleCancelDelete}>
              No
            </Button>
            <div className="edit-timer-dialog-buttons-spacer">
              Are you sure you want to delete the event?
            </div>
            <Button variant="danger" disabled={!isDeletePending} onClick={handleConfirmDelete}>
              Yes
            </Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  )
}

function getDefaultEditedEvent(): EditedEvent {
  return {
    system: '',
    priority: '',
    structure: '',
    type: '',
    standing: '',
    time: { relative: dayjs.duration(0) },
    result: 'No data',
    notes: '',
  }
}
