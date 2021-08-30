import { useCallback, useRef } from 'react'
import { useAsyncHttpRequest } from './use-async-http-request'
import { useHttpRequest } from './use-http-request'

export type Account =
  | { isLoggedIn: false }
  | { isLoggedIn: true, character: { id: number, name: string } }

export function useAccount(): { loading: boolean, account?: Account, logout: () => void } {
  const getSessionInfoOptions = useRef({ credentials: 'include' as const })
  const {
    data: account,
    refresh: refreshSessionInfo,
    complete: sessionInfoComplete,
  } = useHttpRequest<Account>('/api/me', getSessionInfoOptions.current)

  const logoutOptions = useRef<RequestInit>({ method: 'POST', credentials: 'include' })
  const logoutRequest = useAsyncHttpRequest('/auth/logout', logoutOptions.current)

  const logout = useCallback(() => {
    logoutRequest.load().then(() => refreshSessionInfo())
  }, [logoutRequest, refreshSessionInfo])

  return {
    loading: !sessionInfoComplete || logoutRequest.pending,
    account,
    logout,
  }
}
