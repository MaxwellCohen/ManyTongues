import { assign, fromPromise, setup } from 'xstate'

type TranslateReturnState =
  | 'notTranslated'
  | 'translating'
  | 'translated'
  | 'translateError'
import type { GetOrTranslateResult } from '#/lib/translate'
import {
  clampWeight,
  createRandomWeights,
  type FullTranslatorSearch,
  getTranslatorSearchForUrl,
  parseWeights,
  serializeWeights,
  type TranslatorSearch,
  WEIGHT_MAX,
  WEIGHT_MIN,
} from './translateState'

type TranslateContext = {
  formState: FullTranslatorSearch
  dirty: boolean
  translations: Map<string, string>
  error: string | null
  loadedPhrase: string | null
  pendingUrlSearch: Partial<TranslatorSearch> | null
  returnToState: TranslateReturnState | null
}

type TranslateEvent =
  | { type: 'FIELD_CHANGED'; updates: Partial<FullTranslatorSearch> }
  | { type: 'TRANSLATE_REQUESTED' }
  | { type: 'LANGUAGE_HIDDEN'; lang: string }
  | { type: 'WEIGHT_CHANGED'; lang: string; value: number }
  | { type: 'COMMIT_TO_URL' }
  | { type: 'URL_CHANGED'; search: FullTranslatorSearch }
  | { type: 'URL_COMMITTED' }

type TranslateMachineOptions = {
  initialSearch: FullTranslatorSearch
  translatePhrase: (phrase: string) => Promise<GetOrTranslateResult>
  syncToUrl: (search: Partial<TranslatorSearch>) => void | Promise<void>
}

function isTranslateSuccess(
  result: GetOrTranslateResult,
): result is Extract<GetOrTranslateResult, { ok: true }> {
  return result.ok
}

function isTranslateFailure(
  result: GetOrTranslateResult,
): result is Extract<GetOrTranslateResult, { ok: false }> {
  return !result.ok
}

function shouldLoadTranslatedPhrase(search: FullTranslatorSearch): boolean {
  return Boolean(search.translated && search.input.trim())
}

function queueCommittedSearch(formState: FullTranslatorSearch) {
  return getTranslatorSearchForUrl(formState)
}

function resetTranslationState(formState: FullTranslatorSearch) {
  return {
    formState: {
      ...formState,
      translated: false,
    },
    translations: new Map<string, string>(),
    error: null,
    loadedPhrase: null,
  }
}

export function createTranslateMachine({
  initialSearch,
  translatePhrase,
  syncToUrl,
}: TranslateMachineOptions) {
  return setup({
    types: {
      context: {} as TranslateContext,
      events: {} as TranslateEvent,
    },
    actors: {
      translatePhrase: fromPromise(
        async ({ input }: { input: { phrase: string } }) =>
          translatePhrase(input.phrase),
      ),
      syncToUrl: fromPromise(
        async ({ input }: { input: Partial<TranslatorSearch> }) => {
          await syncToUrl(input)
        },
      ),
    },
  }).createMachine({
    id: 'translateWordCloudPage',
    initial: 'bootstrapping',
    context: {
      formState: initialSearch,
      dirty: false,
      translations: new Map<string, string>(),
      error: null,
      loadedPhrase: null,
      pendingUrlSearch: null,
      returnToState: null,
    },
    on: {
      COMMIT_TO_URL: {
        guard: ({ context }) => context.dirty,
        target: '.syncingToUrl',
        actions: assign(({ context }) => ({
          dirty: false,
          pendingUrlSearch: queueCommittedSearch(context.formState),
        })),
      },
      URL_COMMITTED: {
        actions: assign({
          pendingUrlSearch: null,
        }),
      },
      LANGUAGE_HIDDEN: {
        guard: ({ context, event }) =>
          !context.formState.hiddenLanguages.includes(event.lang),
        target: '.syncingToUrl',
        actions: assign(({ context, event }) => {
          const nextFormState = {
            ...context.formState,
            hiddenLanguages: [...context.formState.hiddenLanguages, event.lang],
          }

          return {
            formState: nextFormState,
            dirty: false,
            pendingUrlSearch: queueCommittedSearch(nextFormState),
          }
        }),
      },
      WEIGHT_CHANGED: {
        actions: assign(({ context, event }) => {
          const nextWeights = parseWeights(context.formState.weights)
          nextWeights.set(event.lang, clampWeight(event.value))

          return {
            formState: {
              ...context.formState,
              weights: serializeWeights(nextWeights),
            },
            dirty: true,
          }
        }),
      },
      URL_CHANGED: [
        {
          guard: ({ context, event }) =>
            shouldLoadTranslatedPhrase(event.search) &&
            context.loadedPhrase === event.search.input.trim() &&
            context.translations.size > 0,
          target: '.translated',
          actions: assign(({ event }) => ({
            formState: event.search,
            dirty: false,
            error: null,
            pendingUrlSearch: null,
          })),
        },
        {
          guard: ({ event }) => shouldLoadTranslatedPhrase(event.search),
          target: '.translating',
          reenter: true,
          actions: assign(({ event }) => ({
            formState: event.search,
            dirty: false,
            translations: new Map<string, string>(),
            error: null,
            loadedPhrase: null,
            pendingUrlSearch: null,
          })),
        },
        {
          target: '.notTranslated',
          actions: assign(({ event }) => ({
            ...resetTranslationState(event.search),
            dirty: false,
            pendingUrlSearch: null,
          })),
        },
      ],
    },
    states: {
      bootstrapping: {
        always: [
          {
            guard: ({ context }) => shouldLoadTranslatedPhrase(context.formState),
            target: 'translating',
          },
          {
            target: 'notTranslated',
          },
        ],
      },
      notTranslated: {
        entry: [assign({ returnToState: 'notTranslated' as const })],
        on: {
          FIELD_CHANGED: {
            actions: assign(({ context, event }) => ({
              ...('input' in event.updates &&
              event.updates.input !== context.formState.input
                ? resetTranslationState({
                    ...context.formState,
                    ...event.updates,
                  })
                : {
                    formState: { ...context.formState, ...event.updates },
                  }),
              dirty: true,
            })),
          },
          TRANSLATE_REQUESTED: [
            {
              guard: ({ context }) => !context.formState.input.trim(),
              target: '#translateWordCloudPage.syncingToUrl',
              actions: assign(({ context }) => {
                const nextFormState = {
                  ...context.formState,
                  translated: false,
                }

                return {
                  ...resetTranslationState(nextFormState),
                  dirty: false,
                  pendingUrlSearch: queueCommittedSearch(nextFormState),
                  error: 'Enter some text to translate.',
                }
              }),
            },
            {
              target: 'translating',
              actions: assign({
                translations: () => new Map<string, string>(),
                error: null,
                loadedPhrase: null,
                pendingUrlSearch: null,
              }),
            },
          ],
        },
      },
      translating: {
        entry: [assign({ returnToState: 'translating' as const })],
        invoke: {
          src: 'translatePhrase',
          input: ({ context }) => ({
            phrase: context.formState.input.trim(),
          }),
          onDone: [
            {
              guard: ({ event }) => isTranslateSuccess(event.output),
              target: '#translateWordCloudPage.syncingToUrl',
              actions: assign(({ context, event }) => {
                if (!isTranslateSuccess(event.output)) {
                  return {}
                }

                const nextTranslations = new Map(
                  Object.entries(event.output.translations),
                )
                const nextWeights = context.formState.weights
                  ? (() => {
                      const existing = parseWeights(context.formState.weights)
                      const merged = new Map(existing)
                      for (const lang of nextTranslations.keys()) {
                        if (!merged.has(lang)) {
                          merged.set(
                            lang,
                            Math.floor(Math.random() * WEIGHT_MAX) +
                              WEIGHT_MIN,
                          )
                        }
                      }
                      return merged
                    })()
                  : createRandomWeights(nextTranslations.keys())
                const nextHiddenLanguages =
                  context.formState.hiddenLanguages.filter((lang) =>
                    nextTranslations.has(lang),
                  )
                const nextFormState = {
                  ...context.formState,
                  input: context.formState.input.trim(),
                  translated: true,
                  weights: serializeWeights(nextWeights),
                  hiddenLanguages: nextHiddenLanguages,
                }

                return {
                  formState: nextFormState,
                  dirty: false,
                  translations: nextTranslations,
                  error: null,
                  loadedPhrase: nextFormState.input,
                  pendingUrlSearch: queueCommittedSearch(nextFormState),
                  returnToState: 'translated',
                }
              }),
            },
            {
              target: '#translateWordCloudPage.syncingToUrl',
              actions: assign(({ context, event }) => {
                if (!isTranslateFailure(event.output)) {
                  return {}
                }

                const nextFormState = {
                  ...context.formState,
                  translated: false,
                }

                return {
                  formState: nextFormState,
                  dirty: false,
                  translations: new Map<string, string>(),
                  error: event.output.error,
                  loadedPhrase: null,
                  pendingUrlSearch: queueCommittedSearch(nextFormState),
                  returnToState: 'translateError',
                }
              }),
            },
          ],
        },
        on: {
          FIELD_CHANGED: [
            {
              guard: ({ context, event }) =>
                'input' in event.updates &&
                event.updates.input !== context.formState.input,
              target: 'notTranslated',
              actions: assign(({ context, event }) => ({
                ...resetTranslationState({
                  ...context.formState,
                  ...event.updates,
                }),
                dirty: true,
              })),
            },
            {
              actions: assign(({ context, event }) => ({
                formState: { ...context.formState, ...event.updates },
                dirty: true,
              })),
            },
          ],
        },
      },
      translated: {
        entry: [assign({ returnToState: 'translated' as const })],
        on: {
          FIELD_CHANGED: [
            {
              guard: ({ context, event }) =>
                'input' in event.updates &&
                event.updates.input !== context.formState.input,
              target: 'notTranslated',
              actions: assign(({ context, event }) => ({
                ...resetTranslationState({
                  ...context.formState,
                  ...event.updates,
                }),
                dirty: true,
              })),
            },
            {
              actions: assign(({ context, event }) => ({
                formState: { ...context.formState, ...event.updates },
                dirty: true,
              })),
            },
          ],
          TRANSLATE_REQUESTED: [
            {
              guard: ({ context }) => !context.formState.input.trim(),
              target: '#translateWordCloudPage.syncingToUrl',
              actions: assign(({ context }) => {
                const nextFormState = {
                  ...context.formState,
                  translated: false,
                }

                return {
                  ...resetTranslationState(nextFormState),
                  dirty: false,
                  pendingUrlSearch: queueCommittedSearch(nextFormState),
                  error: 'Enter some text to translate.',
                }
              }),
            },
            {
              target: 'translating',
              actions: assign({
                translations: () => new Map<string, string>(),
                error: null,
                loadedPhrase: null,
                pendingUrlSearch: null,
              }),
            },
          ],
        },
      },
      translateError: {
        entry: [assign({ returnToState: 'translateError' as const })],
        on: {
          FIELD_CHANGED: [
            {
              guard: ({ context, event }) =>
                'input' in event.updates &&
                event.updates.input !== context.formState.input,
              target: 'notTranslated',
              actions: assign(({ context, event }) => ({
                ...resetTranslationState({
                  ...context.formState,
                  ...event.updates,
                }),
                dirty: true,
              })),
            },
            {
              actions: assign(({ context, event }) => ({
                formState: { ...context.formState, ...event.updates },
                dirty: true,
              })),
            },
          ],
          TRANSLATE_REQUESTED: [
            {
              guard: ({ context }) => !context.formState.input.trim(),
              target: '#translateWordCloudPage.syncingToUrl',
              actions: assign(({ context }) => {
                const nextFormState = {
                  ...context.formState,
                  translated: false,
                }

                return {
                  ...resetTranslationState(nextFormState),
                  dirty: false,
                  pendingUrlSearch: queueCommittedSearch(nextFormState),
                  error: 'Enter some text to translate.',
                }
              }),
            },
            {
              target: 'translating',
              actions: assign({
                translations: () => new Map<string, string>(),
                error: null,
                loadedPhrase: null,
                pendingUrlSearch: null,
              }),
            },
          ],
        },
      },
      syncingToUrl: {
        invoke: {
          src: 'syncToUrl',
          input: ({ context }) => context.pendingUrlSearch!,
          onDone: [
            {
              guard: ({ context }) => context.returnToState === 'translated',
              target: 'translated',
              actions: assign({ pendingUrlSearch: null }),
            },
            {
              guard: ({ context }) => context.returnToState === 'translateError',
              target: 'translateError',
              actions: assign({ pendingUrlSearch: null }),
            },
            {
              guard: ({ context }) => context.returnToState === 'translating',
              target: 'translating',
              actions: assign({ pendingUrlSearch: null }),
            },
            {
              target: 'notTranslated',
              actions: assign({ pendingUrlSearch: null }),
            },
          ],
        },
      },
    },
  })
}
