import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('#/lib/translate', () => ({
  getOrTranslatePhrase: vi.fn(),
}))

import { getOrTranslatePhrase } from '#/lib/translate'
import { resolveTranslatorSearch } from './translateState'
import { useTranslatePage } from './useTranslatePage'

describe('useTranslatePage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(getOrTranslatePhrase).mockResolvedValue({
      ok: true,
      translations: { fr: 'bonjour', es: 'hola' },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns formState and loading from initial search', () => {
    const resolvedSearch = resolveTranslatorSearch({ input: 'hello' })
    const onSyncToUrl = vi.fn()

    const { result } = renderHook(() =>
      useTranslatePage({ resolvedSearch, onSyncToUrl }),
    )

    expect(result.current.formState.input).toBe('hello')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.translations.size).toBe(0)
  })

  it('returns cloudData and hasWords when translated', async () => {
    vi.mocked(getOrTranslatePhrase).mockResolvedValue({
      ok: true,
      translations: { fr: 'bonjour' },
    })

    const resolvedSearch = resolveTranslatorSearch({
      input: 'hello',
      translated: true,
    })
    const { result } = renderHook(() =>
      useTranslatePage({
        resolvedSearch,
        onSyncToUrl: vi.fn(),
      }),
    )

    act(() => {
      result.current.send({ type: 'TRANSLATE_REQUESTED' })
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.hasWords).toBe(true)
    expect(result.current.cloudData.length).toBeGreaterThan(0)
    expect(result.current.palette.length).toBeGreaterThan(0)
    expect(result.current.cloudOptions).toBeDefined()
  })
})
