import { useCallback, useEffect, useState } from 'react'

function localStorageHasKey(key: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  const keyIndex = [...new Array<unknown>(window.localStorage.length)]
    .findIndex((_, i) => window.localStorage.key(i) === key)

  return keyIndex >= 0
}

function getLocalStorageValue<T>(
  key: string,
  defaultValue: T,
  deserialize: (serialized: string) => T
): T {
  if (localStorageHasKey(key)) {
    try {
      return deserialize(window.localStorage.getItem(key) ?? 'null')
    } catch (error) {
      console.error(error)
    }
  }
  return defaultValue
}

export interface LocalStorageSerializationOptions<T> {
  deserialize?: (serialized: string) => T
  serialize?: (value: T) => string
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  serializationOptions: LocalStorageSerializationOptions<T> = {}
): [
  value: T,
  setValue: (value: T | ((oldValue: T) => T)) => void,
  clearValue: () => void,
] {
  const {
    deserialize = (JSON.parse as (v: string) => T),
    serialize = JSON.stringify,
  } = serializationOptions

  const [storedValue, setStoredValue] = useState(() =>
    getLocalStorageValue(key, defaultValue, deserialize)
  )
  useEffect(() => {
    setStoredValue(getLocalStorageValue(key, defaultValue, deserialize))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, deserialize])

  const setValue = useCallback((value: T | ((oldValue: T) => T)) => {
    const newValue = typeof value === 'function'
      ? (value as (oldValue: T) => T)(getLocalStorageValue(key, defaultValue, deserialize))
      : value

    if (typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(key, serialize(newValue))
      setStoredValue(newValue)
    }
  }, [key, defaultValue, serialize, deserialize])

  const clearValue = useCallback(() => {
    if (typeof window.localStorage !== 'undefined') {
      window.localStorage.removeItem(key)
    }
    setStoredValue(defaultValue)
  }, [key, defaultValue])

  return [storedValue, setValue, clearValue]
}
