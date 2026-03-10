import { describe, expect, it } from 'vitest'
import { createActor } from 'xstate'
import { createTextCloudMachine } from './textCloudMachine'
import { resolveGeneratorSearch } from './textCloudState'

describe('createTextCloudMachine', () => {
  it('marks edits dirty and queues a clean URL commit', () => {
    const actor = createActor(
      createTextCloudMachine(resolveGeneratorSearch({})),
    )

    actor.start()
    actor.send({
      type: 'FIELD_CHANGED',
      updates: { input: 'hello world' },
    })

    expect(actor.getSnapshot().matches('dirty')).toBe(true)
    expect(actor.getSnapshot().context.formState.input).toBe('hello world')

    actor.send({ type: 'COMMIT_TO_URL' })

    expect(actor.getSnapshot().matches('clean')).toBe(true)
    expect(actor.getSnapshot().context.pendingUrlSearch).toEqual({
      input: 'hello world',
    })

    actor.send({ type: 'URL_COMMITTED' })

    expect(actor.getSnapshot().context.pendingUrlSearch).toBeNull()
  })

  it('hydrates external URL changes without preserving dirty edits', () => {
    const actor = createActor(
      createTextCloudMachine(resolveGeneratorSearch({})),
    )

    actor.start()
    actor.send({
      type: 'FIELD_CHANGED',
      updates: { maxWords: 42 },
    })
    actor.send({
      type: 'URL_CHANGED',
      search: resolveGeneratorSearch({
        maxWords: 25,
        colors: ['#123456'],
      }),
    })

    expect(actor.getSnapshot().matches('clean')).toBe(true)
    expect(actor.getSnapshot().context.formState.maxWords).toBe(25)
    expect(actor.getSnapshot().context.formState.colors).toEqual(['#123456'])
  })

  it('handles multiple FIELD_CHANGED in dirty state', () => {
    const actor = createActor(
      createTextCloudMachine(resolveGeneratorSearch({})),
    )

    actor.start()
    actor.send({ type: 'FIELD_CHANGED', updates: { input: 'first' } })
    expect(actor.getSnapshot().context.formState.input).toBe('first')

    actor.send({ type: 'FIELD_CHANGED', updates: { maxWords: 50 } })
    expect(actor.getSnapshot().context.formState.input).toBe('first')
    expect(actor.getSnapshot().context.formState.maxWords).toBe(50)
    expect(actor.getSnapshot().matches('dirty')).toBe(true)
  })
})
