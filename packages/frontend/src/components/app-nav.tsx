import { Button, Container, Nav, Navbar } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import { useAccount } from '../hooks/use-account'

export interface NavPage {
  href: string
  title: string
}

export interface AppNavProps {
  pages: NavPage[]
}

export function AppNav(props: AppNavProps): JSX.Element {
  const account = useAccount()
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
            {account.loading
              ? <Navbar.Text>Loading…</Navbar.Text>
              : account.account?.isLoggedIn
                ? <>
                    <Navbar.Text>{account.account.character.name}</Navbar.Text>
                    <Button onClick={account.logout}>Log Out</Button>
                  </>
                : <Button onClick={navigateTo('/login')} href="/login">Log In</Button>
            }
          </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
