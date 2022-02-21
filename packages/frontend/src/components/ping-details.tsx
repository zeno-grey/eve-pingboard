import { Col, Row } from 'react-bootstrap'
import { ApiPing } from '@ping-board/common'
import { dayjs } from '../utils/dayjs'
import { RelativeTime } from './relative-time'
import { SlackMessage } from './slack-message'
import { Time } from './time'

export function PingDetails({ ping }: { ping: ApiPing }): JSX.Element {
  return (
    <Row className="mt-n2">
      {ping.scheduledFor && (<>
        <Col xs={3}>EVE Time</Col>
        <Col xs={9}>
          <Time
            time={dayjs.utc(ping.scheduledFor)}
            asLink
            format="YYYY-MM-DD HH:mm"
          />
        </Col>

        <Col xs={3}>Local Time</Col>
        <Col xs={9}>
          <Time time={ping.scheduledFor} /> (
            <RelativeTime time={ping.scheduledFor} />
          )
        </Col>
      </>)}

      <Col xs={3}>Channel</Col>
      <Col xs={9}>{ping.slackChannelName}</Col>

      <Col xs={3}>Sent By</Col>
      <Col xs={9}>{ping.author}</Col>

      <hr className="my-1" />

      <Col xs={3}>Ping Text</Col>
      <Col xs={9}>
        <SlackMessage text={ping.text} />
      </Col>
    </Row>
  )
}
