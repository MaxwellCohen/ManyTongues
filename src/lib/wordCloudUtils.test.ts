import { describe, expect, it } from 'vitest'
import {
  DEFAULT_BG,
  DEFAULT_COLORS,
  DEFAULT_FONT_FAMILY,
  DEFAULT_TEXT,
  FONT_FAMILY_OPTIONS,
  SCALE_OPTIONS,
  tokenizeAndCount,
} from './wordCloudUtils'

describe('tokenizeAndCount', () => {
  it('returns empty array for empty string', () => {
    expect(tokenizeAndCount('')).toEqual([])
  })

  it('returns empty array for whitespace only', () => {
    expect(tokenizeAndCount('   \n\t  ')).toEqual([])
  })

  it('counts words and sorts by frequency descending', () => {
    const result = tokenizeAndCount('hello world hello')
    expect(result).toEqual([
      { text: 'hello', value: 2 },
      { text: 'world', value: 1 },
    ])
  })

  it('normalizes to lowercase', () => {
    const result = tokenizeAndCount('Hello HELLO hello')
    expect(result).toEqual([{ text: 'hello', value: 3 }])
  })

  it('strips non-letter and non-number characters', () => {
    const result = tokenizeAndCount('hello, world! (test)')
    expect(result).toEqual([
      { text: 'hello', value: 1 },
      { text: 'world', value: 1 },
      { text: 'test', value: 1 },
    ])
  })

  it('handles unicode letters and numbers', () => {
    const result = tokenizeAndCount('café 123 résumé')
    expect(result).toEqual([
      { text: 'café', value: 1 },
      { text: '123', value: 1 },
      { text: 'résumé', value: 1 },
    ])
  })
})

describe('wordCloudUtils constants', () => {
  it('exports DEFAULT_TEXT', () => {
    expect(DEFAULT_TEXT).toContain('Paste any text')
  })

  it('exports DEFAULT_COLORS', () => {
    expect(DEFAULT_COLORS).toEqual(['#173a40', '#328f97', '#4fb8b2', '#2f6a4a'])
  })

  it('exports DEFAULT_BG', () => {
    expect(DEFAULT_BG).toBe('#e8f4f0')
  })

  it('exports DEFAULT_FONT_FAMILY', () => {
    expect(DEFAULT_FONT_FAMILY).toBe('system-ui')
  })

  it('exports SCALE_OPTIONS', () => {
    expect(SCALE_OPTIONS).toHaveLength(3)
    expect(SCALE_OPTIONS[0]).toEqual({ value: 'linear', label: 'Linear' })
  })

  it('exports FONT_FAMILY_OPTIONS', () => {
    expect(FONT_FAMILY_OPTIONS.length).toBeGreaterThan(0)
    expect(FONT_FAMILY_OPTIONS[0]).toEqual({ value: 'system-ui', label: 'System UI' })
  })
})
