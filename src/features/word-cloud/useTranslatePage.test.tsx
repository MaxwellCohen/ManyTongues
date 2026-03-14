import { act, renderHook, waitFor } from '@testing-library/react'
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

  it('returns formState and loading from initial search (no phrase in URL)', () => {
    const resolvedSearch = resolveTranslatorSearch({ input: '' })
    const onSyncToUrl = vi.fn()

    const { result } = renderHook(() =>
      useTranslatePage({ resolvedSearch, onSyncToUrl }),
    )

    expect(result.current.formState.input).toBe('')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.translations.size).toBe(0)
  })

  it('returns cloudData and hasWords when URL has input and translated true (loads and shows translations)', async () => {
    vi.mocked(getOrTranslatePhrase).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                translations: { fr: 'bonjour' },
              }),
            0,
          ),
        ),
    )

    const resolvedSearch = resolveTranslatorSearch({
      input: 'hello',
      translated: true,
    })
    const onSyncToUrl = vi.fn()
    const { result } = renderHook(() =>
      useTranslatePage({
        resolvedSearch,
        onSyncToUrl,
      }),
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.hasWords).toBe(true)
    expect(result.current.cloudData.length).toBeGreaterThan(0)
    expect(result.current.palette.length).toBeGreaterThan(0)
    expect(result.current.cloudOptions).toBeDefined()
  })

  it('calls onSyncToUrl and sets translations when requestTranslate succeeds', async () => {
    vi.useRealTimers()
    vi.mocked(getOrTranslatePhrase).mockResolvedValue({
      ok: true,
      translations: { fr: 'bonjour' },
    })

    let resolvedSearch = resolveTranslatorSearch({ input: '' })
    const onSyncToUrl = vi.fn((search) => {
      resolvedSearch = resolveTranslatorSearch(search)
    })
    const { result, rerender } = renderHook(
      ({ resolved, onSync }) =>
        useTranslatePage({ resolvedSearch: resolved, onSyncToUrl: onSync }),
      {
        initialProps: {
          resolved: resolvedSearch,
          onSync: onSyncToUrl,
        },
      },
    )

    act(() => {
      result.current.requestTranslate('hello')
    })

    await waitFor(
      () => {
        expect(result.current.translations.get('fr')).toBe('bonjour')
      },
      { timeout: 500 },
    )

    rerender({
      resolved: resolvedSearch,
      onSync: onSyncToUrl,
    })
    expect(result.current.hasWords).toBe(true)
    expect(onSyncToUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        input: 'hello',
        translated: true,
      }),
    )
    vi.useFakeTimers()
  })
})
