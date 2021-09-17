import { Col, Container, Row } from 'react-bootstrap'
import { Redirect, useLocation } from 'react-router-dom'
import logo from '../../brave-logo.svg'
import { useGetUserQuery } from '../../store'
import loginButton from './eve-sso-login-black-large.png'
import './login.scss'

export function LoginPage(): JSX.Element {
  const me = useGetUserQuery()

  const location = useLocation()

  if (me.data?.isLoggedIn) {
    return <Redirect to="/" />
  }

  const urlParams = new URLSearchParams(location.search)
  const postLoginRedirect = urlParams.get('postLoginRedirect')
  const loginUrl = '/auth/login' + (
    postLoginRedirect
    ? `?${new URLSearchParams({ postLoginRedirect })}`
    : ''
  )

  return (
    <Container className="login-container">
      <div style={{ flex: '33%' }} />
      <Row className="jumbotron" style={{ justifyContent: 'center' }}>
        <Col sm={7}>
          <h1>Brave Collective PingBoard</h1>
          <hr />
          <p>Log in with your EVE Online Account to gain access.</p>
          <p>
            <a href={loginUrl}>
              <img src={loginButton} alt="LOG IN with EVE Online" />
            </a>
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
          <img src={logo} alt="Logo" className="img-fluid" />
        </Col>
      </Row>
      <div style={{ flex: '66%' }} />
    </Container>
  )
}
