import { Container, Nav, Navbar } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

export interface NavPage {
  href: string
  title: string
}

export interface AppNavProps {
  pages: NavPage[]
}

export function AppNav(props: AppNavProps): JSX.Element {
  const history = useHistory()
  const navigateTo = (href: string) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    history.push(href)
  }

  return (
    <Navbar variant="dark" bg="primary" expand="lg">
      <Container fluid>
        <Navbar.Brand href="/">Brave Collective Pingboard</Navbar.Brand>
        <Navbar.Toggle aria-controle="navbar-nav" />
          <Navbar.Collapse id="navbar-nav" className="justify-content-end">
            <Nav variant="pills" className="me-auto">
              {props.pages.map(page => (
                <Nav.Link onClick={navigateTo(page.href)} key={page.title} href={page.href}>
                  {page.title}
                </Nav.Link>
              ))}
            </Nav>
          </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
