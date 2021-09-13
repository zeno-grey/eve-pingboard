import 'bootstrap/dist/css/bootstrap.min.css'
import './app.css'
import './custom.scss'
import { AppNav, NavPage } from './components/app-nav'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import { LoginPage, PingsPage, TimersPage } from './pages'
import { AppFooter } from './components/app-footer'

export default function App(): JSX.Element {
  const pages: { href: string, title?: string, component: () => JSX.Element }[] = [
    { href: '/timers', title: 'Timers', component: TimersPage },
    { href: '/pings', title: 'Pings', component: PingsPage },
    { href: '/login', component: LoginPage },
  ]
  const navPages: NavPage[] = pages.filter(
    (p): p is NavPage & { component: () => JSX.Element } => !!p.title
  )

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <header>
          <AppNav pages={navPages} />
        </header>
        <main className="main">
          <Switch>
            {pages.map(page => (
              <Route key={page.href} path={page.href} component={page.component} />
            ))}
            <Redirect from="/" to="/timers" />
          </Switch>
        </main>
        <footer>
          <AppFooter />
        </footer>
      </div>
    </BrowserRouter>
  )
}
