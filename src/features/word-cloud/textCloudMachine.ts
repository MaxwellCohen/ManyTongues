import { assign, setup } from 'xstate'
import {
  type FullGeneratorSearch,
  type GeneratorSearch,
  getGeneratorSearchForUrl,
} from './textCloudState'

type TextCloudContext = {
  formState: FullGeneratorSearch
  dirty: boolean
  pendingUrlSearch: Partial<GeneratorSearch> | null
}

type TextCloudEvent =
  | { type: 'FIELD_CHANGED'; updates: Partial<FullGeneratorSearch> }
  | { type: 'COMMIT_TO_URL' }
  | { type: 'URL_CHANGED'; search: FullGeneratorSearch }
  | { type: 'URL_COMMITTED' }

export function createTextCloudMachine(initialSearch: FullGeneratorSearch) {
  return setup({
    types: {
      context: {} as TextCloudContext,
      events: {} as TextCloudEvent,
    },
  }).createMachine({
    id: 'textCloudPage',
    initial: 'hydratingFromUrl',
    context: {
      formState: initialSearch,
      dirty: false,
      pendingUrlSearch: null,
    },
    states: {
      hydratingFromUrl: {
        always: {
          target: 'idle',
        },
      },
      idle: {
        on: {
          FIELD_CHANGED: {
            target: 'editing',
            actions: assign(({ context, event }) => ({
              formState: { ...context.formState, ...event.updates },
              dirty: true,
            })),
          },
          URL_CHANGED: {
            actions: assign(({ event }) => ({
              formState: event.search,
              dirty: false,
              pendingUrlSearch: null,
            })),
          },
          URL_COMMITTED: {
            actions: assign({
              pendingUrlSearch: null,
            }),
          },
        },
      },
      editing: {
        on: {
          FIELD_CHANGED: {
            actions: assign(({ context, event }) => ({
              formState: { ...context.formState, ...event.updates },
              dirty: true,
            })),
          },
          COMMIT_TO_URL: {
            target: 'idle',
            actions: assign(({ context }) => ({
              dirty: false,
              pendingUrlSearch: getGeneratorSearchForUrl(context.formState),
            })),
          },
          URL_CHANGED: {
            target: 'idle',
            actions: assign(({ event }) => ({
              formState: event.search,
              dirty: false,
              pendingUrlSearch: null,
            })),
          },
          URL_COMMITTED: {
            actions: assign({
              pendingUrlSearch: null,
            }),
          },
        },
      },
    },
  })
}
