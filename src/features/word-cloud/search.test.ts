import { describe, expect, it } from 'vitest'
import {
  getSearchDiffFromDefaults,
  getValidPalette,
  isHexColor,
  mergeSearchWithDefaults,
} from './search'

describe('getSearchDiffFromDefaults', () => {
  it('returns empty object when state matches defaults', () => {
    const defaults = { a: 1, b: 'x' }
    expect(getSearchDiffFromDefaults({ a: 1, b: 'x' }, defaults)).toEqual({})
  })

  it('returns only differing keys', () => {
    const defaults = { a: 1, b: 'x', c: true }
    expect(getSearchDiffFromDefaults({ a: 2, b: 'x', c: true }, defaults)).toEqual({
      a: 2,
    })
  })

  it('includes array when length differs', () => {
    const defaults = { colors: ['#111', '#222'] }
    expect(getSearchDiffFromDefaults({ colors: ['#111'] }, defaults)).toEqual({
      colors: ['#111'],
    })
  })

  it('includes array when elements differ', () => {
    const defaults = { colors: ['#111', '#222'] }
    expect(getSearchDiffFromDefaults({ colors: ['#111', '#333'] }, defaults)).toEqual({
      colors: ['#111', '#333'],
    })
  })

  it('excludes array when identical', () => {
    const defaults = { colors: ['#111', '#222'] }
    expect(getSearchDiffFromDefaults({ colors: ['#111', '#222'] }, defaults)).toEqual({})
  })
})

describe('mergeSearchWithDefaults', () => {
  it('merges search over defaults', () => {
    const defaults = { a: 1, b: 'x' }
    expect(mergeSearchWithDefaults(defaults, { a: 2 }, [])).toEqual({
      a: 2,
      b: 'x',
    })
  })

  it('uses search array when provided for array keys', () => {
    const defaults = { a: 1, colors: ['#111'] }
    expect(mergeSearchWithDefaults(defaults, { colors: ['#222'] }, ['colors'])).toEqual({
      a: 1,
      colors: ['#222'],
    })
  })

  it('falls back to defaults for array keys when search omits them', () => {
    const defaults = { a: 1, colors: ['#111'] }
    expect(mergeSearchWithDefaults(defaults, {}, ['colors'])).toEqual({
      a: 1,
      colors: ['#111'],
    })
  })
})

describe('isHexColor', () => {
  it('returns true for valid 6-digit hex', () => {
    expect(isHexColor('#123456')).toBe(true)
    expect(isHexColor('#abcdef')).toBe(true)
    expect(isHexColor('#ABCDEF')).toBe(true)
  })

  it('returns false for invalid formats', () => {
    expect(isHexColor('#12345')).toBe(false)
    expect(isHexColor('#1234567')).toBe(false)
    expect(isHexColor('123456')).toBe(false)
    expect(isHexColor('#gggggg')).toBe(false)
    expect(isHexColor('')).toBe(false)
  })
})

describe('getValidPalette', () => {
  it('returns valid hex colors only', () => {
    expect(getValidPalette(['#111111', 'invalid', '#222222'], ['#fallback'])).toEqual([
      '#111111',
      '#222222',
    ])
  })

  it('returns fallback when no valid colors', () => {
    expect(getValidPalette(['invalid', 'nope'], ['#111', '#222'])).toEqual([
      '#111',
      '#222',
    ])
  })

  it('returns empty fallback when no valid colors and empty fallback', () => {
    expect(getValidPalette(['invalid'], [])).toEqual([])
  })
})
