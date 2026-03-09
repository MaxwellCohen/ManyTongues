import { DEFAULT_COLORS, DEFAULT_FONT_FAMILY, type ScaleType } from '#/lib/wordCloudUtils'
import { getSearchDiffFromDefaults, getValidPalette, mergeSearchWithDefaults } from './search'

export const TRANSLATOR_BG = '#c9a227'
export const TRANSLATOR_TEXT_COLOR = '#000000'
export const translatorScaleOptions = ['linear', 'sqrt', 'log'] as const

export type TranslatorSearch = {
  input?: string
  translated?: boolean
  maxWords?: number
  minFontSize?: number
  maxFontSize?: number
  padding?: number
  scale?: (typeof translatorScaleOptions)[number]
  rotationMin?: number
  rotationMax?: number
  rotations?: number
  deterministic?: boolean
  fontFamily?: string
  backgroundColor?: string
  colors?: string[]
  hiddenLanguages?: string[]
  weights?: string
}

export type FullTranslatorSearch = Required<TranslatorSearch>

export const DEFAULT_TRANSLATOR_SEARCH: FullTranslatorSearch = {
  input: 'everything will be great',
  translated: false,
  maxWords: 1000,
  minFontSize: 14,
  maxFontSize: 72,
  padding: 1,
  scale: 'sqrt' as ScaleType,
  rotationMin: -90,
  rotationMax: 90,
  rotations: 3,
  deterministic: true,
  fontFamily: DEFAULT_FONT_FAMILY,
  backgroundColor: TRANSLATOR_BG,
  colors: [TRANSLATOR_TEXT_COLOR],
  hiddenLanguages: [],
  weights: '',
}

export const DEFAULT_WEIGHT = 50
export const WEIGHT_MIN = 1
export const WEIGHT_MAX = 200

const translatorArrayKeys = ['colors', 'hiddenLanguages'] as const satisfies readonly (keyof FullTranslatorSearch)[]

export function clampWeight(value: number): number {
  return Math.min(
    WEIGHT_MAX,
    Math.max(WEIGHT_MIN, Math.round(Number(value) || DEFAULT_WEIGHT)),
  )
}

export function parseWeights(value: string): Map<string, number> {
  const weights = new Map<string, number>()

  for (const part of value.split(',')) {
    const [lang, rawWeight] = part.split(':')
    if (!lang || !rawWeight) continue

    const parsed = Number(rawWeight)
    if (!Number.isFinite(parsed)) continue

    weights.set(lang, clampWeight(parsed))
  }

  return weights
}

export function serializeWeights(weights: Map<string, number>): string {
  return Array.from(weights.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([lang, weight]) => `${lang}:${clampWeight(weight)}`)
    .join(',')
}

export function createRandomWeights(
  languages: Iterable<string>,
): Map<string, number> {
  const weights = new Map<string, number>()

  for (const lang of languages) {
    weights.set(lang, Math.floor(Math.random() * WEIGHT_MAX) + WEIGHT_MIN)
  }

  return weights
}

export function resolveTranslatorSearch(
  search: TranslatorSearch,
): FullTranslatorSearch {
  return mergeSearchWithDefaults(
    DEFAULT_TRANSLATOR_SEARCH,
    search,
    translatorArrayKeys,
  )
}

export function getTranslatorSearchForUrl(
  state: FullTranslatorSearch,
): Partial<TranslatorSearch> {
  return getSearchDiffFromDefaults(state, DEFAULT_TRANSLATOR_SEARCH)
}

export function getTranslatorPalette(colors: string[]): string[] {
  return getValidPalette(colors, DEFAULT_COLORS)
}

/** Set of hidden language codes for quick lookup. */
export function getHiddenLanguagesSet(
  formState: FullTranslatorSearch,
): Set<string> {
  return new Set(formState.hiddenLanguages)
}

/** Translations filtered to those not hidden. */
export function getVisibleTranslations(
  translations: Map<string, string>,
  hiddenLanguages: Set<string>,
): [string, string][] {
  return Array.from(translations.entries()).filter(
    ([lang]) => !hiddenLanguages.has(lang),
  )
}

export type TranslatorCloudWord = { text: string; value: number }

/** Word cloud items: source phrase (if any) plus visible translations with clamped weights. */
export function getCloudData(
  formState: FullTranslatorSearch,
  translations: Map<string, string>,
  weights: Map<string, number>,
  hiddenLanguages: Set<string>,
): TranslatorCloudWord[] {
  if (
    !formState.translated ||
    (!formState.input.trim() && translations.size === 0)
  ) {
    return []
  }

  const items: TranslatorCloudWord[] = []
  const phrase = formState.input.trim()
  if (phrase) {
    items.push({ text: phrase, value: 1000 })
  }
  translations.forEach((translatedText, lang) => {
    if (hiddenLanguages.has(lang)) return
    const weight = weights.get(lang) ?? DEFAULT_WEIGHT
    items.push({ text: translatedText, value: clampWeight(weight) })
  })
  return items
}

export type TranslatorCloudOptions = {
  minFontSize: number
  maxFontSize: number
  padding: number
  scale: FullTranslatorSearch['scale']
  rotationAngles: [number, number]
  rotations: number
  deterministic: boolean
  fontFamily: string
  randomSeed: string
}

/** Cloud layout options derived from form state. */
export function getCloudOptions(
  formState: FullTranslatorSearch,
): TranslatorCloudOptions {
  return {
    minFontSize: formState.minFontSize,
    maxFontSize: formState.maxFontSize,
    padding: formState.padding,
    scale: formState.scale,
    rotationAngles: [formState.rotationMin, formState.rotationMax],
    rotations: formState.rotations,
    deterministic: formState.deterministic,
    fontFamily: formState.fontFamily,
    randomSeed: 'translator',
  }
}
