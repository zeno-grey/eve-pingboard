import { useEffect, useMemo } from 'react'
import { useAsyncHttpRequest } from './use-async-http-request'

export interface UseHttpRequest<T> {
  pending: boolean
  complete: boolean
  refresh: () => Promise<void>
  data?: T
  response?: Response
  error?: unknown
}

export function useHttpRequest<T>(
  url: string,
  requestOptions?: RequestInit
): Readonly<UseHttpRequest<T>> {
  const { load, ...request } = useAsyncHttpRequest<T>(url, requestOptions)
  useEffect(() => { load() }, [load])

  const response = useMemo(() => ({
    ...request,
    refresh: load,
  }), [load, request])

  return response
}
