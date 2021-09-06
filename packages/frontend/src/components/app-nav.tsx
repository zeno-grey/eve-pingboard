import { Button, Container, Nav, Navbar } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import { useGetUserQuery, useLogOutMutation } from '../store'

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

  const user = useGetUserQuery()
  const [logout, { isLoading: isLoggingOut }] = useLogOutMutation()

  const isLoading = user.isFetching || isLoggingOut

  return (
    <Navbar variant="dark" bg="primary" expand="lg">
      <Container fluid>
        <Navbar.Brand href="/">Brave Collective Pingboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav" className="justify-content-end">
            <Nav variant="pills" className="me-auto">
              {props.pages.map(page => (
                <Nav.Link onClick={navigateTo(page.href)} key={page.title} href={page.href}>
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
                : <Button onClick={navigateTo('/login')} href="/login">Log In</Button>
            }
          </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
