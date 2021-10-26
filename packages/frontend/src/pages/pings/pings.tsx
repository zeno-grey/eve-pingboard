import { UserRoles } from '@ping-board/common'
import { Container } from 'react-bootstrap'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { useGetUserQuery } from '../../store'
import { ManagePingTemplates } from './manage-ping-templates'
import { SendPings } from './send-pings'
import { SentPings } from './sent-pings'
import { ManagePingViewAccess } from './manage-view-access'
import './pings.scss'

export function PingsPage(): JSX.Element {
  const me = useGetUserQuery()

  const canRead = me.data?.isLoggedIn && me.data.character.roles.includes(UserRoles.PING)
  const canEdit = me.data?.isLoggedIn &&
    me.data.character.roles.includes(UserRoles.PING_TEMPLATES_WRITE)

  const { path, url } = useRouteMatch()

  if (!me.isFetching) {
    if (!me.data?.isLoggedIn) {
      return <Redirect to={`/login?postLoginRedirect=${url}`} />
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
    <Switch>
      <Route exact path={path}>
        <SendPings />
      </Route>
      <Route path={`${path}/sent`}>
        <SentPings />
      </Route>
      {canEdit && <>
        <Route path={`${path}/templates`}>
          <ManagePingTemplates />
        </Route>
        <Route path={`${path}/view-access`}>
          <ManagePingViewAccess />
        </Route>
      </>}
    </Switch>
  )
}
