import { useCallback, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

interface LocalStorageState<T> {
  error: string | null
  value: T
}

function readLocalStorage<T>(key: string, initialValue: T): LocalStorageState<T> {
  if (typeof window === 'undefined') {
    return { error: null, value: initialValue }
  }

  try {
    const item = window.localStorage.getItem(key)
    return {
      error: null,
      value: item ? (JSON.parse(item) as T) : initialValue,
    }
  } catch {
    return {
      error: 'Saved data could not be read. Fresh defaults were loaded.',
      value: initialValue,
    }
  }
}

function writeLocalStorage(key: string, value: unknown): string | null {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return null
  } catch {
    return 'Changes could not be saved to this browser.'
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<LocalStorageState<T>>(() =>
    readLocalStorage(key, initialValue),
  )

  const setStoredValue: Dispatch<SetStateAction<T>> = useCallback(
    (nextValue) => {
      setState((currentState) => {
        const resolvedValue =
          typeof nextValue === 'function'
            ? (nextValue as (currentValue: T) => T)(currentState.value)
            : nextValue

        return {
          error: writeLocalStorage(key, resolvedValue),
          value: resolvedValue,
        }
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setState({ error: null, value: initialValue })
    } catch {
      setState({
        error: 'Saved data could not be cleared.',
        value: initialValue,
      })
    }
  }, [initialValue, key])

  return [state.value, setStoredValue, removeValue, state.error] as const
}
