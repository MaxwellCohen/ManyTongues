import { describe, expect, it, vi } from 'vitest'
import {
  clampWeight,
  createRandomWeights,
  DEFAULT_TRANSLATOR_SEARCH,
  getCloudData,
  getCloudOptions,
  getHiddenLanguagesSet,
  getTranslatorPalette,
  getTranslatorSearchForUrl,
  getVisibleTranslations,
  parseWeights,
  resolveTranslatorSearch,
  serializeWeights,
  WEIGHT_MAX,
  WEIGHT_MIN,
} from './translateState'

describe('clampWeight', () => {
  it('clamps to WEIGHT_MIN when below', () => {
    expect(clampWeight(-10)).toBe(WEIGHT_MIN)
    expect(clampWeight(0.4)).toBe(WEIGHT_MIN)
  })

  it('uses DEFAULT_WEIGHT for 0 (falsy)', () => {
    expect(clampWeight(0)).toBe(3)
  })

  it('clamps to WEIGHT_MAX when above', () => {
    expect(clampWeight(300)).toBe(WEIGHT_MAX)
    expect(clampWeight(999)).toBe(WEIGHT_MAX)
  })

  it('rounds and uses DEFAULT_WEIGHT for NaN', () => {
    expect(clampWeight(NaN)).toBe(3)
  })

  it('returns value within range', () => {
    expect(clampWeight(3)).toBe(3)
    expect(clampWeight(5)).toBe(5)
  })
})

describe('parseWeights', () => {
  it('parses "lang:weight" format', () => {
    const m = parseWeights('fr:3,es:5')
    expect(m.get('fr')).toBe(3)
    expect(m.get('es')).toBe(5)
  })

  it('skips invalid parts', () => {
    const m = parseWeights('fr:50,invalid,es:100')
    expect(m.size).toBe(2)
  })

  it('clamps to valid range', () => {
    const m = parseWeights('fr:10')
    expect(m.get('fr')).toBe(WEIGHT_MAX)
  })

  it('returns empty map for empty string', () => {
    expect(parseWeights('').size).toBe(0)
  })
})

describe('serializeWeights', () => {
  it('serializes map to sorted string', () => {
    const m = new Map([
      ['es', 5],
      ['fr', 3],
    ])
    expect(serializeWeights(m)).toBe('es:5,fr:3')
  })

  it('clamps values when serializing', () => {
    const m = new Map([['fr', 500]])
    expect(serializeWeights(m)).toBe('fr:5')
  })
})

describe('createRandomWeights', () => {
  it('creates weights for each language in range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const m = createRandomWeights(['fr', 'es'])
    expect(m.size).toBe(2)
    expect(m.get('fr')).toBe(WEIGHT_MIN)
    expect(m.get('es')).toBe(WEIGHT_MIN)
    vi.restoreAllMocks()
  })
})

describe('resolveTranslatorSearch', () => {
  it('returns defaults when search is empty', () => {
    const result = resolveTranslatorSearch({})
    expect(result.input).toBe(DEFAULT_TRANSLATOR_SEARCH.input)
    expect(result.translated).toBe(false)
  })

  it('merges partial search', () => {
    const result = resolveTranslatorSearch({ input: 'hello' })
    expect(result.input).toBe('hello')
  })

  it('handles array keys', () => {
    const result = resolveTranslatorSearch({ hiddenLanguages: ['fr'] })
    expect(result.hiddenLanguages).toEqual(['fr'])
  })
})

describe('getTranslatorSearchForUrl', () => {
  it('returns diff from defaults', () => {
    const state = { ...DEFAULT_TRANSLATOR_SEARCH, input: 'custom' }
    expect(getTranslatorSearchForUrl(state)).toEqual({ input: 'custom' })
  })

  it('returns empty when no diff', () => {
    expect(getTranslatorSearchForUrl(DEFAULT_TRANSLATOR_SEARCH)).toEqual({})
  })
})

describe('getTranslatorPalette', () => {
  it('returns valid hex colors', () => {
    expect(getTranslatorPalette(['#111111', '#222222'])).toEqual(['#111111', '#222222'])
  })

  it('falls back to default when invalid', () => {
    const result = getTranslatorPalette(['invalid'])
    expect(result).toHaveLength(4)
    expect(result[0]).toMatch(/^#[0-9a-f]{6}$/i)
  })
})

describe('getHiddenLanguagesSet', () => {
  it('returns set of hidden languages', () => {
    const formState = { ...DEFAULT_TRANSLATOR_SEARCH, hiddenLanguages: ['fr', 'es'] }
    expect(getHiddenLanguagesSet(formState)).toEqual(new Set(['fr', 'es']))
  })
})

describe('getVisibleTranslations', () => {
  it('filters out hidden languages', () => {
    const translations = new Map([
      ['fr', 'bonjour'],
      ['es', 'hola'],
      ['de', 'hallo'],
    ])
    const hidden = new Set(['fr'])
    expect(getVisibleTranslations(translations, hidden)).toEqual([
      ['es', 'hola'],
      ['de', 'hallo'],
    ])
  })

  it('returns all when none hidden', () => {
    const translations = new Map([['fr', 'bonjour']])
    expect(getVisibleTranslations(translations, new Set())).toEqual([['fr', 'bonjour']])
  })
})

describe('getCloudData', () => {
  it('returns phrase and visible translations when input and translations exist', () => {
    const formState = {
      ...DEFAULT_TRANSLATOR_SEARCH,
      translated: false,
      input: 'hello',
    }
    const translations = new Map([['fr', 'x']])
    const weights = new Map([['fr', 3]])
    expect(getCloudData(formState, translations, weights, new Set())).toEqual([
      { text: 'hello', value: 12 },
      { text: 'x', value: 3 },
    ])
  })

  it('returns phrase and visible translations when translated', () => {
    const formState = {
      ...DEFAULT_TRANSLATOR_SEARCH,
      translated: true,
      input: 'hello',
    }
    const translations = new Map([
      ['fr', 'bonjour'],
      ['es', 'hola'],
    ])
    const weights = new Map([
      ['fr', 3],
      ['es', 5],
    ])
    expect(getCloudData(formState, translations, weights, new Set())).toEqual([
      { text: 'hello', value: 12 },
      { text: 'bonjour', value: 3 },
      { text: 'hola', value: 5 },
    ])
  })

  it('excludes hidden languages', () => {
    const formState = {
      ...DEFAULT_TRANSLATOR_SEARCH,
      translated: true,
      input: 'hello',
    }
    const translations = new Map([
      ['fr', 'bonjour'],
      ['es', 'hola'],
    ])
    const weights = new Map([
      ['fr', 3],
      ['es', 3],
    ])
    const hidden = new Set(['fr'])
    expect(getCloudData(formState, translations, weights, hidden)).toEqual([
      { text: 'hello', value: 12 },
      { text: 'hola', value: 3 },
    ])
  })

  it('returns empty when no input and no translations', () => {
    const formState = {
      ...DEFAULT_TRANSLATOR_SEARCH,
      input: '   ',
    }
    expect(getCloudData(formState, new Map(), new Map(), new Set())).toEqual([])
  })
})

describe('getCloudOptions', () => {
  it('derives options from form state', () => {
    const formState = {
      ...DEFAULT_TRANSLATOR_SEARCH,
      minFontSize: 10,
      maxFontSize: 80,
      rotationMin: -45,
      rotationMax: 45,
    }
    const opts = getCloudOptions(formState)
    expect(opts.minFontSize).toBe(10)
    expect(opts.maxFontSize).toBe(80)
    expect(opts.rotationAngles).toEqual([-45, 45])
    expect(opts.randomSeed).toBe('translator')
  })
})
