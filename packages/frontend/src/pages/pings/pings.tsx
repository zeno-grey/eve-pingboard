import { UserRoles } from '@ping-board/common'
import { Container } from 'react-bootstrap'
import { Link, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { useGetUserQuery } from '../../store'
import { ManagePings } from './manage-pings'
import { SendPings } from './send-pings'
import './pings.scss'
import { SentPings } from './sent-pings'

export function PingsPage(): JSX.Element {
  const me = useGetUserQuery()

  const canRead = me.data?.isLoggedIn && me.data.character.roles.includes(UserRoles.PING)
  const canEdit = me.data?.isLoggedIn &&
    me.data.character.roles.includes(UserRoles.PING_TEMPLATES_WRITE)

  const { path, url } = useRouteMatch()

  if (!me.isFetching) {
    if (!me.data?.isLoggedIn) {
      return <Redirect to="/login" />
    }
    if (!canRead) {
      return (
        <Container fluid>
          <h6>Sorry, you don&apos;t have permission to view this page.</h6>
        </Container>
      )
    }
  }

  return (
    <Container>
      <Switch>
        <Route exact path={path}>
          <div className="pings-header">
            <h3>Send Pings</h3>
            <Link to={`${url}/sent`} className="btn btn-primary" role="button">
              Show Sent Pings
            </Link>
            <div style={{ flex: 1 }} />
            {canEdit &&
              <Link to={`${url}/manage`} className="btn btn-primary" role="button">
                <i className="bi-wrench" /> Manage Ping Templates
              </Link>
            }
          </div>
          <SendPings />
        </Route>
        <Route path={`${path}/sent`}>
          <SentPings />
        </Route>
        {canEdit &&
          <Route path={`${path}/manage`}>
            <ManagePings />
          </Route>
        }
      </Switch>
    </Container>
  )
}
