import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createXStateFormControls } from './xstateForm'

describe('createXStateFormControls', () => {
  it('updateFields sends FIELD_CHANGED with updates', () => {
    const send = vi.fn()
    const { result } = renderHook(() =>
      createXStateFormControls<{ a: number; b: string }>(send),
    )
    act(() => {
      result.current.updateFields({ a: 10 })
    })
    expect(send).toHaveBeenCalledWith({ type: 'FIELD_CHANGED', updates: { a: 10 } })
  })

  it('changeField sends FIELD_CHANGED for single key', () => {
    const send = vi.fn()
    const { result } = renderHook(() =>
      createXStateFormControls<{ name: string }>(send),
    )
    act(() => {
      result.current.changeField('name')('hello')
    })
    expect(send).toHaveBeenCalledWith({
      type: 'FIELD_CHANGED',
      updates: { name: 'hello' },
    })
  })

  it('commitToUrl sends COMMIT_TO_URL', () => {
    const send = vi.fn()
    const { result } = renderHook(() =>
      createXStateFormControls<{ a: number }>(send),
    )
    act(() => {
      result.current.commitToUrl()
    })
    expect(send).toHaveBeenCalledWith({ type: 'COMMIT_TO_URL' })
  })
})
