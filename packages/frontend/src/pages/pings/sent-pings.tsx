import { UserRoles } from '@ping-board/common'
import { Alert, Button, Col, Row, Table } from 'react-bootstrap'
import { Link, useRouteMatch } from 'react-router-dom'
import { Time } from '../../components/time'
import { useGetUserQuery } from '../../store'
import './pings.scss'
import './sent-pings.scss'
import { usePingsList } from './use-pings-list'

export function SentPings(): JSX.Element {
  const me = useGetUserQuery()

  const canRead = me.data?.isLoggedIn && me.data?.character.roles.includes(UserRoles.PING)

  const pings = usePingsList({ skip: me.isLoading || !canRead })

  const { url } = useRouteMatch()
  const pingsUrl = url.split('/').slice(0, url.split('/').length - 1).join('/')

  return (<>
    <div className="pings-header">
      <h3>Sent Pings</h3>
      <Button onClick={pings.reload} disabled={pings.loading}>
        <i className="bi-arrow-clockwise" /> Reload
      </Button>
      <div style={{ flex: 1 }} />
      <Link to={pingsUrl} className="btn btn-primary" role="button">
        <i className="bi-arrow-left" /> Back to Pings
      </Link>
    </div>
    <Row>
      <Col xs={12}>
        <Alert variant="info">
          These Pings were either sent by you, or were sent to channels you have view access to.
          View access is determined by your Neucore groups, not which Slack channels you are in.
        </Alert>
      </Col>
      <Col xs={12}>
        <Table hover size="sm" variant="dark" responsive className="sent-pings-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Sent at</th>
              <th>Sent to</th>
              <th>Text</th>
            </tr>
          </thead>
          <tbody>
            {pings.pings.length < 1 &&
              <tr>
                <td colSpan={4}>No Pings to show</td>
              </tr>
            }
            {pings.pings.map(p => (
              <tr key={p.id}>
                <td>{p.author}</td>
                <td><Time time={p.sentAt} format="YYYY-MM-DD HH:mm" /></td>
                <td>{p.slackChannelName}</td>
                <td className="text-cell">
                  <div title={p.text}>
                    {p.text}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Button
          style={{ width: '100%' }}
          disabled={!pings.hasMore || pings.loading}
          onClick={pings.loadMore}
        >
          {pings.loading
            ? 'Loading…'
            : pings.hasMore
              ? 'Load more'
              : '(No more pings)'
          }
        </Button>
      </Col>
    </Row>
  </>)
}
