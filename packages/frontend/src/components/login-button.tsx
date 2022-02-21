import loginButton from './eve-sso-login-black-large.png'

export interface LoginButtonProps {
  postLoginRedirect?: string | null
}
export function LoginButton({
  postLoginRedirect,
}: LoginButtonProps): JSX.Element {
  const loginUrl= '/auth/login' + (
    postLoginRedirect ? `?${new URLSearchParams({ postLoginRedirect })}` : ''
  )

  return (
    <a href={loginUrl}>
      <img src={loginButton} alt="LOG IN with EVE Online" />
    </a>
  )
}
