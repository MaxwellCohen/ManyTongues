import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounceValue } from './useDebouncedValue'

describe('useDebounceValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounceValue('hello', 150))
    expect(result.current).toBe('hello')
  })

  it('updates after delay when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounceValue(value, delay),
      { initialProps: { value: 'hello', delay: 150 } },
    )

    expect(result.current).toBe('hello')

    rerender({ value: 'world', delay: 150 })

    expect(result.current).toBe('hello')

    act(() => {
      vi.advanceTimersByTime(150)
    })

    expect(result.current).toBe('world')
  })

  it('ignores stale updates when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounceValue(value, 150),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(50))
    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(50))
    rerender({ value: 'd' })
    act(() => vi.advanceTimersByTime(150))

    expect(result.current).toBe('d')
  })

  it('uses custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounceValue(value, delay),
      { initialProps: { value: 'hello', delay: 300 } },
    )

    rerender({ value: 'world', delay: 300 })
    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBe('hello')

    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBe('world')
  })
})
