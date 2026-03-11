import { useEffect, useRef, useState } from 'react'

const DEBOUNCE_DELAY_MS = 150

/**
 * Returns a value that updates only after the input has been stable for `delayMs`.
 */
export function useDebounceValue<T>(value: T, delayMs: number = DEBOUNCE_DELAY_MS): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const valueRef = useRef(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  valueRef.current = value

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      setDebouncedValue(valueRef.current)
    }, delayMs)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [value, delayMs])

  return debouncedValue
}
