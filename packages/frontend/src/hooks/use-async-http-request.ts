import { useCallback, useMemo, useRef, useState } from 'react'

export interface UseAsyncHttpRequest<T> {
  pending: boolean
  complete: boolean
  load: () => Promise<void>
  data?: T
  response?: Response
  error?: unknown
}

export function useAsyncHttpRequest<T>(
  url: string,
  requestOptions?: RequestInit
): Readonly<UseAsyncHttpRequest<T>> {
  const [request, setRequest] = useState<Omit<UseAsyncHttpRequest<T>, 'load'>>({
    pending: false,
    complete: false,
  })
  const abortController = useRef<AbortController | null>(null)

  const performReq = useCallback(async (url: string, requestOptions?: RequestInit) => {
    abortController.current?.abort()
    setRequest(res => ({
      ...res,
      pending: false,
      complete: false,
    }))
    abortController.current = new AbortController()
    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: abortController.current.signal,
      })
      const data = await response.json() as T
      setRequest({
        complete: true,
        pending: false,
        data,
        response,
      })
    } catch (error: unknown) {
      setRequest({
        complete: true,
        pending: false,
        error,
      })
    }
  }, [])

  const load = useCallback(
    () => performReq(url, requestOptions),
    [performReq, requestOptions, url]
  )

  const response = useMemo<UseAsyncHttpRequest<T>>(() => ({
    ...request,
    load: load,
  }), [load, request])

  return response
}
