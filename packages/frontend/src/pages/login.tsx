import { Col, Container, Row } from 'react-bootstrap'
import { Navigate, useLocation } from 'react-router-dom'
import { BraveLogo } from '../components/brave-logo'
import { LoginButton } from '../components/login-button'
import { useGetUserQuery } from '../store'
import './login.scss'

export function LoginPage(): JSX.Element {
  const me = useGetUserQuery()

  const location = useLocation()

  if (me.data?.isLoggedIn) {
    return <Navigate to="/" />
  }

  const urlParams = new URLSearchParams(location.search)
  const postLoginRedirect = urlParams.get('postLoginRedirect')

  return (
    <Container className="login-container">
      <div style={{ flex: '33%' }} />
      <Row className="jumbotron" style={{ justifyContent: 'center' }}>
        <Col sm={7}>
          <h1>Brave Collective PingBoard</h1>
          <hr />
          <p>Log in with your EVE Online Account to gain access.</p>
          <p>
            <LoginButton postLoginRedirect={postLoginRedirect} />
          </p>
          <p>
            You first need a{' '}
            <a href="https://account.bravecollective.com/" target="_blank" rel="noreferrer">
              BRAVE Core Service Account
            </a>{' '}
            to log in here.
          </p>
        </Col>
        <Col sm={5}>
          <BraveLogo />
        </Col>
      </Row>
      <div style={{ flex: '66%' }} />
    </Container>
  )
}
