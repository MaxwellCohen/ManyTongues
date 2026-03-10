import { describe, expect, it } from 'vitest'
import {
  MAX_PHRASE_LENGTH,
  parseStoredTranslations,
  validatePhrase,
} from './translateValidation'

describe('validatePhrase', () => {
  it('returns error for empty string', () => {
    expect(validatePhrase('')).toEqual({
      ok: false,
      error: 'Enter a phrase to translate.',
    })
  })

  it('returns error for whitespace-only', () => {
    expect(validatePhrase('   \n\t  ')).toEqual({
      ok: false,
      error: 'Enter a phrase to translate.',
    })
  })

  it('returns error for undefined', () => {
    expect(validatePhrase(undefined)).toEqual({
      ok: false,
      error: 'Enter a phrase to translate.',
    })
  })

  it('returns error for phrase over max length', () => {
    const long = 'a'.repeat(MAX_PHRASE_LENGTH + 1)
    expect(validatePhrase(long)).toEqual({
      ok: false,
      error: `Keep the phrase under ${MAX_PHRASE_LENGTH} characters.`,
    })
  })

  it('returns ok with trimmed phrase for valid input', () => {
    expect(validatePhrase('  hello  ')).toEqual({ ok: true, phrase: 'hello' })
  })

  it('accepts phrase at exactly max length', () => {
    const exact = 'a'.repeat(MAX_PHRASE_LENGTH)
    expect(validatePhrase(exact)).toEqual({ ok: true, phrase: exact })
  })
})

describe('parseStoredTranslations', () => {
  it('returns null for null input', () => {
    expect(parseStoredTranslations(null)).toBe(null)
  })

  it('returns null for empty string', () => {
    expect(parseStoredTranslations('')).toBe(null)
  })

  it('parses valid JSON', () => {
    expect(
      parseStoredTranslations(JSON.stringify({ fr: 'bonjour', es: 'hola' })),
    ).toEqual({ fr: 'bonjour', es: 'hola' })
  })

  it('returns null for invalid JSON', () => {
    expect(parseStoredTranslations('invalid {{{')).toBe(null)
  })
})
