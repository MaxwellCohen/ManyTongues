import { afterEach, describe, expect, it, vi } from 'vitest'
import { createActor } from 'xstate'
import { createTranslateMachine } from './translateMachine'
import { resolveTranslatorSearch } from './translateState'

const waitForState = (
  actor: ReturnType<typeof createActor>,
  matcher: string,
) =>
  vi.waitFor(
    () => expect(actor.getSnapshot().matches(matcher)).toBe(true),
    { interval: 1, timeout: 100 },
  )

describe('createTranslateMachine', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads translated phrases from URL state on boot', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const translatePhrase = vi.fn().mockResolvedValue({
      ok: true,
      translations: {
        fr: 'bonjour',
        es: 'hola',
      },
    })
    const syncToUrl = vi.fn(() => Promise.resolve())
    const actor = createActor(
      createTranslateMachine({
        initialSearch: resolveTranslatorSearch({
          input: 'hello',
          translated: true,
          hiddenLanguages: ['fr', 'zz'],
        }),
        translatePhrase,
        syncToUrl,
      }),
    )

    actor.start()

    await waitForState(actor, 'translated')

    expect(translatePhrase).toHaveBeenCalledWith('hello')
    expect(actor.getSnapshot().context.translations).toEqual(
      new Map([
        ['fr', 'bonjour'],
        ['es', 'hola'],
      ]),
    )
    expect(actor.getSnapshot().context.formState.hiddenLanguages).toEqual([
      'fr',
    ])
    expect(syncToUrl).toHaveBeenCalledWith({
      hiddenLanguages: ['fr'],
      input: 'hello',
      translated: true,
      weights: 'es:1,fr:1',
    })
    expect(actor.getSnapshot().context.pendingUrlSearch).toBeNull()
  })

  it('queues an error state when translation fails', async () => {
    const syncToUrl = vi.fn(() => Promise.resolve())
    const actor = createActor(
      createTranslateMachine({
        initialSearch: resolveTranslatorSearch({
          input: 'hello',
        }),
        translatePhrase: vi.fn().mockResolvedValue({
          ok: false,
          error: 'Translation failed.',
        }),
        syncToUrl,
      }),
    )

    actor.start()
    actor.send({ type: 'TRANSLATE_REQUESTED' })

    await waitForState(actor, 'translateError')

    expect(actor.getSnapshot().context.error).toBe('Translation failed.')
    expect(actor.getSnapshot().context.formState.translated).toBe(false)
    expect(syncToUrl).toHaveBeenCalledWith({ input: 'hello' })
    expect(actor.getSnapshot().context.pendingUrlSearch).toBeNull()
  })

  it('ignores stale translation results after the input changes', async () => {
    let resolveTranslation: (value: {
      ok: true
      translations: Record<string, string>
    }) => void = () => {}
    const translatePhrase = vi.fn(
      () =>
        new Promise<{ ok: true; translations: Record<string, string> }>(
          (resolve) => {
            resolveTranslation = resolve
          },
        ),
    )
    const actor = createActor(
      createTranslateMachine({
        initialSearch: resolveTranslatorSearch({
          input: 'hello',
        }),
        translatePhrase,
        syncToUrl: vi.fn(() => Promise.resolve()),
      }),
    )

    actor.start()
    actor.send({ type: 'TRANSLATE_REQUESTED' })

    expect(actor.getSnapshot().matches('translating')).toBe(true)

    actor.send({
      type: 'FIELD_CHANGED',
      updates: { input: 'changed phrase' },
    })

    expect(actor.getSnapshot().matches('notTranslated')).toBe(true)
    expect(actor.getSnapshot().context.formState.input).toBe('changed phrase')

    resolveTranslation({
      ok: true,
      translations: { fr: 'bonjour' },
    })
    await Promise.resolve()

    expect(actor.getSnapshot().matches('notTranslated')).toBe(true)
    expect(actor.getSnapshot().context.formState.input).toBe('changed phrase')
    expect(actor.getSnapshot().context.translations.size).toBe(0)
  })

  it('shows error when translating with empty input', async () => {
    const syncToUrl = vi.fn(() => Promise.resolve())
    const actor = createActor(
      createTranslateMachine({
        initialSearch: resolveTranslatorSearch({ input: '' }),
        translatePhrase: vi.fn(),
        syncToUrl,
      }),
    )

    actor.start()
    actor.send({ type: 'TRANSLATE_REQUESTED' })

    await waitForState(actor, 'notTranslated')

    expect(actor.getSnapshot().context.error).toBe('Enter some text to translate.')
    expect(syncToUrl).toHaveBeenCalledWith({ input: '' })
  })

  it('handles WEIGHT_CHANGED and marks dirty', async () => {
    const actor = createActor(
      createTranslateMachine({
        initialSearch: resolveTranslatorSearch({
          input: 'hello',
          translated: true,
          weights: 'fr:50,es:100',
        }),
        translatePhrase: vi.fn().mockResolvedValue({
          ok: true,
          translations: { fr: 'bonjour', es: 'hola' },
        }),
        syncToUrl: vi.fn(() => Promise.resolve()),
      }),
    )

    actor.start()

    await waitForState(actor, 'translated')

    actor.send({ type: 'WEIGHT_CHANGED', lang: 'fr', value: 75 })

    expect(actor.getSnapshot().context.formState.weights).toContain('75')
    expect(actor.getSnapshot().context.dirty).toBe(true)
  })

  it('does not sync when COMMIT_TO_URL and not dirty', async () => {
    const syncToUrl = vi.fn(() => Promise.resolve())
    const actor = createActor(
      createTranslateMachine({
        initialSearch: resolveTranslatorSearch({ input: 'hello' }),
        translatePhrase: vi.fn(),
        syncToUrl,
      }),
    )

    actor.start()
    actor.send({ type: 'COMMIT_TO_URL' })

    expect(actor.getSnapshot().matches('notTranslated')).toBe(true)
    expect(syncToUrl).not.toHaveBeenCalled()
  })

  it('does not add LANGUAGE_HIDDEN when already hidden', async () => {
    const syncToUrl = vi.fn(() => Promise.resolve())
    const actor = createActor(
      createTranslateMachine({
        initialSearch: resolveTranslatorSearch({
          input: 'hello',
          translated: true,
          hiddenLanguages: ['fr'],
        }),
        translatePhrase: vi.fn().mockResolvedValue({
          ok: true,
          translations: { fr: 'bonjour', es: 'hola' },
        }),
        syncToUrl,
      }),
    )

    actor.start()
    actor.send({ type: 'TRANSLATE_REQUESTED' })

    await waitForState(actor, 'translated')

    const beforeSyncCount = syncToUrl.mock.calls.length
    actor.send({ type: 'LANGUAGE_HIDDEN', lang: 'fr' })

    expect(actor.getSnapshot().context.formState.hiddenLanguages).toEqual([
      'fr',
    ])
    expect(syncToUrl.mock.calls.length).toBe(beforeSyncCount)
  })
})
