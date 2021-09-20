import { ApiEventEntry } from '@ping-board/common'
import { Col, Modal, ModalProps, Row } from 'react-bootstrap'
import { ConstellationLink } from '../../components/constellation-link'
import { RegionLink } from '../../components/region-link'
import { RelativeTime } from '../../components/relative-time'
import { SolarSystemLink } from '../../components/solar-system-link'
import { Time } from '../../components/time'
import { CalendarEntry } from '../../store/calendar-slice'
import { dayjs } from '../../utils/dayjs'

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
          {entry?.title}
          {entry?.baseEntry.type === 'event' && (<>
            <h6 className="m-0">Timerboard Event</h6>
          </>)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {entry?.baseEntry.type === 'event' && (
          <CalendarEntryEventBody event={entry.baseEntry.event} />
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
