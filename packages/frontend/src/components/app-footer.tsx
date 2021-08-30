import { Container, Navbar } from 'react-bootstrap'
import './app-footer.css'

export function AppFooter(): JSX.Element {
  return (
    <Navbar variant="dark" bg="primary" expand="lg">
      <Container>
        <div className="footer">
          Brave Collective Services. For support write to support@bravecollective.freshdesk.com
          or ask in the ingame channel &apos;Brave IT Team&apos;.
        </div>
      </Container>
    </Navbar>
  )
}
