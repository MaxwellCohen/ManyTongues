import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GENERATOR_SEARCH,
  getGeneratorPalette,
  getGeneratorSearchForUrl,
  resolveGeneratorSearch,
} from './textCloudState'

describe('resolveGeneratorSearch', () => {
  it('returns defaults when search is empty', () => {
    const result = resolveGeneratorSearch({})
    expect(result.input).toBe(DEFAULT_GENERATOR_SEARCH.input)
    expect(result.maxWords).toBe(1000)
  })

  it('merges partial search', () => {
    const result = resolveGeneratorSearch({ maxWords: 50, input: 'custom' })
    expect(result.maxWords).toBe(50)
    expect(result.input).toBe('custom')
  })

  it('handles colors array', () => {
    const result = resolveGeneratorSearch({ colors: ['#111', '#222'] })
    expect(result.colors).toEqual(['#111', '#222'])
  })
})

describe('getGeneratorSearchForUrl', () => {
  it('returns diff from defaults', () => {
    const state = { ...DEFAULT_GENERATOR_SEARCH, maxWords: 100 }
    expect(getGeneratorSearchForUrl(state)).toEqual({ maxWords: 100 })
  })

  it('returns empty when no diff', () => {
    expect(getGeneratorSearchForUrl(DEFAULT_GENERATOR_SEARCH)).toEqual({})
  })
})

describe('getGeneratorPalette', () => {
  it('returns valid hex colors', () => {
    expect(getGeneratorPalette(['#111111', '#222222'])).toEqual(['#111111', '#222222'])
  })

  it('falls back to default when invalid', () => {
    expect(getGeneratorPalette(['invalid'])).toEqual(DEFAULT_GENERATOR_SEARCH.colors)
  })
})
