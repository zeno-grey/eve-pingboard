import { Col, Modal, ModalProps, Row } from 'react-bootstrap'
import { ApiEventEntry } from '@ping-board/common'
import { ConstellationLink } from './constellation-link'
import { PingDetails } from './ping-details'
import { RegionLink } from './region-link'
import { RelativeTime } from './relative-time'
import { SolarSystemLink } from './solar-system-link'
import { Time } from './time'
import { CalendarEntry } from '../store/calendar-slice'
import { dayjs } from '../utils/dayjs'

export interface CalendarEntryDialogProps {
  entry?: CalendarEntry | null
}
export function CalendarEntryDialog({
  entry,
  ...modalProps
}: CalendarEntryDialogProps & ModalProps): JSX.Element {
  return (
    <Modal {...modalProps}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={{
            event: 'bi-stopwatch',
            ping: 'bi-broadcast-pin',
          }[entry?.baseEntry.type ?? 'event']} />{' '}
          {entry?.title}
          <h6 className="m-0">
            {{
              event: 'Timerboard Event',
              ping: 'Ping',
            }[entry?.baseEntry.type ?? 'event']}
          </h6>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {entry?.baseEntry.type === 'event' && (
          <CalendarEntryEventBody event={entry.baseEntry.event} />
        )}
        {entry?.baseEntry.type === 'ping' && (
          <PingDetails ping={entry.baseEntry.ping} />
        )}
      </Modal.Body>
    </Modal>
  )
}

function CalendarEntryEventBody({ event }: { event: ApiEventEntry }): JSX.Element {
  return (
    <Row className="mt-n2">
      <Col xs={3}>EVE Time</Col>
      <Col xs={9}>
        <Time
          time={dayjs.utc(event.time)}
          asLink
          format="YYYY-MM-DD HH:mm"
        />
      </Col>

      <Col xs={3}>Local Time</Col>
      <Col xs={9}>
        <Time time={event.time} /> (
          <RelativeTime time={event.time} />
        )
      </Col>

      <Col xs={3}>Priority</Col>
      <Col xs={9}>{event.priority}</Col>

      <hr className="my-1" />

      <Col xs={3}>System</Col>
      <Col xs={9}>
        <SolarSystemLink system={event.system} />
      </Col>

      <Col xs={3}>Constellation</Col>
      <Col xs={9}>
        <ConstellationLink
          constellation={event.constellation}
          region={event.region}
        />
      </Col>

      <Col xs={3}>Region</Col>
      <Col xs={9}>
        <RegionLink
          region={event.region}
          system={event.system}
        />
      </Col>

      <hr className="my-1" />

      {event.result && (<>
        <Col xs={3}>Result</Col>
        <Col xs={9}>{event.result}</Col>
      </>)}

      <Col xs={3}>Standing</Col>
      <Col xs={9}>{event.standing}</Col>

      <Col xs={3}>Type</Col>
      <Col xs={9}>{event.type}</Col>

      <Col xs={3}>Structure</Col>
      <Col xs={9}>{event.structure}</Col>

      {event.notes && (<>
        <Col xs={3}>Notes</Col>
        <Col xs={9}>{event.notes.split('\n').map(line => (
          <>{line}<br /></>
        ))}</Col>
      </>)}
    </Row>
  )
}
