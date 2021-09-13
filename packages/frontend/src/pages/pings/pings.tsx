import { UserRoles } from '@ping-board/common'
import { Container } from 'react-bootstrap'
import { Redirect } from 'react-router-dom'
import { useGetUserQuery } from '../../store'
import { SendPings } from './send-pings'
import './pings.scss'

export function PingsPage(): JSX.Element {
  const me = useGetUserQuery()

  const canRead = me.data?.isLoggedIn && me.data.character.roles.includes(UserRoles.PING)

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
      <div className="pings-header">
        <h3>Send Pings</h3>
      </div>
      <SendPings />
    </Container>
  )
}
