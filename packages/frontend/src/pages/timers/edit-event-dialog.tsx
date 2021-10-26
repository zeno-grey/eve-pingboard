import { ApiEventEntry, ApiEventEntryInput } from '@ping-board/common'
import clsx from 'clsx'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { DateTimeInput } from '../../components/date-time-input'
import { RelativeTimeInput } from '../../components/relative-time-input'
import {
  AbsoluteOrRelativeTime,
  useAbsoluteRelativeTimeInput,
} from '../../hooks/use-absolute-relative-time-input'
import { dayjs } from '../../utils/dayjs'
import './edit-event-dialog.scss'
import { SolarSystemInput } from './solar-system-input'

type EditedEvent = Omit<ApiEventEntryInput, 'time'>

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
  const inputTime: AbsoluteOrRelativeTime = useMemo(() => event
    ? { absolute: dayjs.utc(event.time) }
    : { relative: dayjs.duration(0) }
  , [event])

  useEffect(() => {
    setEditedEvent(event
      ? { ...event }
      : getDefaultEditedEvent()
    )
  }, [event])

  const timeInput = useAbsoluteRelativeTimeInput({ time: inputTime })

  const canSave = Object.entries(editedEvent ?? {}).every(([k, v]) => k === 'notes' || !!v)
  const save = () => {
    if (canSave && onSave) {
      onSave({
        ...editedEvent,
        time: timeInput.absoluteTime.toISOString(),
      })
      setEditedEvent(getDefaultEditedEvent())
    }
  }

  const isNewEvent = typeof event?.id !== 'number'
  const lastEdited = !isNewEvent && [
    `Last edited by ${event?.updatedBy ?? 'unknown'}`,
    event?.updatedAt
      ? `at ${dayjs(event.updatedAt).format('llll')} (${dayjs(event.updatedAt).fromNow()})`
      : 'unknown',
  ].join(' ')
  const usesAbsoluteTime = timeInput.inputMode === 'absolute'

  const setEventField = <T extends keyof EditedEvent>(field: T, value: EditedEvent[T]) => {
    setEditedEvent(e => ({ ...e, [field]: value }))
  }

  type ValueKeys<T, V> = { [K in keyof T]: T[K] extends V ? T[K] : never }
  const handleSelectValueChange = <T extends keyof ValueKeys<EditedEvent, string>>(field: T) =>
    (e: ChangeEvent<HTMLSelectElement>) => setEventField(field, e.target.value as EditedEvent[T])

  const [isDeletePending, setIsDeletePending] = useState(false)
  const handleStartDelete = () => setIsDeletePending(true)
  const handleCancelDelete = () => setIsDeletePending(false)
  const handleConfirmDelete = () => {
    setIsDeletePending(false)
    onDelete?.()
    setEditedEvent(getDefaultEditedEvent())
  }

  return (
    <Modal show={show} size="lg" backdrop="static" dialogClassName="edit-event-dialog">
      <Modal.Header>
        <Modal.Title>{isNewEvent ? 'Add' : 'Edit'} Event</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            {lastEdited && <Col xs={12} className="mb-3">{lastEdited}</Col>}

            <Form.Group as={Col} controlId="solarSystem" xs={12} sm={6} className="mb-3">
              <Form.Label>Solar System</Form.Label>
              <SolarSystemInput
                value={editedEvent.system}
                onChange={s => setEventField('system', s?.name ?? '')}
                placeholder="e.g. NBPH-N"
              />
            </Form.Group>

            <Form.Group as={Col} controlId="priority" xs={12} sm={6} className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={editedEvent.priority}
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
                value={editedEvent.structure}
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
                value={editedEvent.type}
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
                value={editedEvent.standing}
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
                value={editedEvent.result}
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
                  onChange={() => timeInput.handleChangeInputMode('absolute')}
                  id="absolute"
                  checked={usesAbsoluteTime}
                />
              </Form.Label>
              <DateTimeInput
                value={timeInput.absoluteTime}
                onChange={timeInput.handleAbsoluteDateChange}
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
                  onChange={() => timeInput.handleChangeInputMode('relative')}
                  id="relative"
                  checked={!usesAbsoluteTime}
                />
              </Form.Label>
              <RelativeTimeInput
                value={timeInput.relativeTime}
                onChange={timeInput.handleRelativeDateChange}
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
      <Modal.Footer className="dialog-footer">
        <div className={clsx('dialog-buttons-wrapper', isDeletePending && 'hidden')}>
          {!isNewEvent && (
            <>
              <Button
                variant="danger"
                disabled={isDeletePending}
                onClick={handleStartDelete}
              >
                Delete
              </Button>
              <div className="dialog-buttons-spacer" />
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
            'confirm-delete-buttons-wrapper',
            !isDeletePending && 'hidden'
          )}>
            <Button disabled={!isDeletePending} onClick={handleCancelDelete}>
              No
            </Button>
            <div className="dialog-buttons-spacer">
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
    result: 'No data',
    notes: '',
  }
}
