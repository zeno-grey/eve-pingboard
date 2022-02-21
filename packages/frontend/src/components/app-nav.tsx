import { Button, Container, Nav, Navbar } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'
import { useGetUserQuery, useLogOutMutation } from '../store'

export interface NavPage {
  href: string
  title: string
}

export interface AppNavProps {
  pages: NavPage[]
}

export function AppNav(props: AppNavProps): JSX.Element {
  const user = useGetUserQuery(void 0, {
    pollingInterval: 60 * 1000,
  })
  const [logout, { isLoading: isLoggingOut }] = useLogOutMutation()

  const isLoading = user.isFetching || isLoggingOut

  return (
    <Navbar variant="dark" bg="primary" expand="md">
      <Container fluid>
        <Navbar.Brand href="/">Brave Collective Pingboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav" className="justify-content-end">
            <Nav variant="pills" className="me-auto">
              {props.pages.map(page => (
                <Nav.Link
                  as={NavLink}
                  key={page.title}
                  to={page.href}
                >
                  {page.title}
                </Nav.Link>
              ))}
            </Nav>
            {isLoading
              ? <Navbar.Text>Loading…</Navbar.Text>
              : user.data?.isLoggedIn
                ? <>
                    <Navbar.Text>{user.data.character.name}</Navbar.Text>
                    <Button onClick={() => logout()}>Log Out</Button>
                  </>
                : <Link className="btn btn-primary" type="button" to="/login">Log In</Link>
            }
          </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
