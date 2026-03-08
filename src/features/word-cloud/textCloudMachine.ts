import { assign, setup } from 'xstate'
import {
  type FullGeneratorSearch,
  type GeneratorSearch,
  getGeneratorSearchForUrl,
} from './textCloudState'

type TextCloudContext = {
  formState: FullGeneratorSearch
  pendingUrlSearch: Partial<GeneratorSearch> | null
}

type TextCloudEvent =
  | { type: 'FIELD_CHANGED'; updates: Partial<FullGeneratorSearch> }
  | { type: 'COMMIT_TO_URL' }
  | { type: 'URL_CHANGED'; search: FullGeneratorSearch }
  | { type: 'URL_COMMITTED' }

function applyFieldUpdates(
  formState: FullGeneratorSearch,
  updates: Partial<FullGeneratorSearch>,
): FullGeneratorSearch {
  return { ...formState, ...updates }
}

function queueCommittedSearch(formState: FullGeneratorSearch) {
  return getGeneratorSearchForUrl(formState)
}

export function createTextCloudMachine(initialSearch: FullGeneratorSearch) {
  return setup({
    types: {
      context: {} as TextCloudContext,
      events: {} as TextCloudEvent,
    },
  }).createMachine({
    id: 'textCloudPage',
    initial: 'clean',
    context: {
      formState: initialSearch,
      pendingUrlSearch: null,
    },
    on: {
      URL_CHANGED: {
        target: '.clean',
        actions: assign(({ event }) => ({
          formState: event.search,
          pendingUrlSearch: null,
        })),
      },
      URL_COMMITTED: {
        actions: assign({
          pendingUrlSearch: null,
        }),
      },
    },
    states: {
      clean: {
        on: {
          FIELD_CHANGED: {
            target: 'dirty',
            actions: assign(({ context, event }) => ({
              formState: applyFieldUpdates(context.formState, event.updates),
            })),
          },
        },
      },
      dirty: {
        on: {
          FIELD_CHANGED: {
            actions: assign(({ context, event }) => ({
              formState: applyFieldUpdates(context.formState, event.updates),
            })),
          },
          COMMIT_TO_URL: {
            target: 'clean',
            actions: assign(({ context }) => ({
              pendingUrlSearch: queueCommittedSearch(context.formState),
            })),
          },
        },
      },
    },
  })
}
