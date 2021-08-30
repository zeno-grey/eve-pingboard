import { Col, Container, Row } from 'react-bootstrap'
import logo from '../../brave-logo.svg'
import loginButton from './eve-sso-login-black-large.png'
import './login.scss'

export function LoginPage(): JSX.Element {
  return (
    <Container className="login-container">
      <div style={{ flex: '33%' }} />
      <Row className="jumbotron" style={{ justifyContent: 'center' }}>
        <Col sm={7}>
          <h1>Brave Collective PingBoard</h1>
          <hr />
          <p>Log in with your EVE Online Account to gain access.</p>
          <p>
            <a href="/auth/login">
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
