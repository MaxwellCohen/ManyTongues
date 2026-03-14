import { DEFAULT_COLORS, DEFAULT_FONT_FAMILY, type ScaleType, type SpiralType } from '#/lib/wordCloudUtils'

/** Simple hash for word -> stable index into palette. */
export function hashWordForColor(word: string): number {
  let h = 0
  for (let i = 0; i < word.length; i++) {
    h = (h << 5) - h + word.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}
import { getSearchDiffFromDefaults, getValidPalette, mergeSearchWithDefaults } from './search'

const TRANSLATOR_BG = '#c9a227'
const TRANSLATOR_TEXT_COLOR = '#000000'
export const translatorScaleOptions = ['linear', 'sqrt', 'log'] as const
export const translatorSpiralOptions = ['archimedean', 'rectangular'] as const

export const translatorCloud2ShapeOptions = [
  'circle',
  'cardioid',
  'diamond',
  'square',
  'triangle-forward',
  'triangle',
  'pentagon',
  'star',
] as const
export const translatorCloud2ColorOptions = ['random-dark', 'random-light', 'custom'] as const
export const translatorCloud2FontWeightOptions = ['normal', 'bold'] as const

export type TranslatorSearch = {
  input?: string
  translated?: boolean
  minFontSize?: number
  maxFontSize?: number
  padding?: number
  scale?: (typeof translatorScaleOptions)[number]
  spiral?: (typeof translatorSpiralOptions)[number]
  rotationMin?: number
  rotationMax?: number
  rotations?: number
  deterministic?: boolean
  fontFamily?: string
  backgroundColor?: string
  colors?: string[]
  hiddenLanguages?: string[]
  weights?: string
  /** wordcloud2.js options (translation page). Rotation in degrees for URL/form. */
  cloud2Shape?: (typeof translatorCloud2ShapeOptions)[number]
  cloud2Ellipticity?: number
  cloud2Shuffle?: boolean
  cloud2RotateRatio?: number
  cloud2Color?: (typeof translatorCloud2ColorOptions)[number]
  cloud2GridSize?: number
  cloud2MinRotation?: number
  cloud2MaxRotation?: number
  cloud2RotationSteps?: number
  cloud2MinSize?: number
  cloud2FontWeight?: (typeof translatorCloud2FontWeightOptions)[number]
}

export type FullTranslatorSearch = Required<TranslatorSearch>

export const DEFAULT_TRANSLATOR_SEARCH: FullTranslatorSearch = {
  input: 'everything will be great',
  translated: false,
  minFontSize: 14,
  maxFontSize: 72,
  padding: 1,
  scale: 'sqrt' as ScaleType,
  spiral: 'archimedean' as SpiralType,
  rotationMin: -90,
  rotationMax: 90,
  rotations: 3,
  deterministic: true,
  fontFamily: DEFAULT_FONT_FAMILY,
  backgroundColor: TRANSLATOR_BG,
  colors: [TRANSLATOR_TEXT_COLOR],
  hiddenLanguages: [],
  weights: '',
  cloud2Shape: 'circle',
  cloud2Ellipticity: 0.65,
  cloud2Shuffle: true,
  cloud2RotateRatio: 0.1,
  cloud2Color: 'random-dark',
  cloud2GridSize: 8,
  cloud2MinRotation: -90,
  cloud2MaxRotation: 90,
  cloud2RotationSteps: 0,
  cloud2MinSize: 0,
  cloud2FontWeight: 'normal',
}

export const DEFAULT_WEIGHT = 3
export const WEIGHT_MIN = 1
export const WEIGHT_MAX = 5

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

type TranslatorCloudWord = { text: string; value: number }

/** Word cloud items: source phrase (if any) plus visible translations with clamped weights. */
export function getCloudData(
  formState: FullTranslatorSearch,
  translations: Map<string, string>,
  weights: Map<string, number>,
  hiddenLanguages: Set<string>,
): TranslatorCloudWord[] {
  if (!formState.input.trim() && translations.size === 0) {
    return []
  }

  const items: TranslatorCloudWord[] = []
  const phrase = formState.input.trim()
  if (phrase) {
    items.push({ text: phrase, value: 12 })
  }
  translations.forEach((translatedText, lang) => {
    if (hiddenLanguages.has(lang)) return
    const weight = weights.get(lang) ?? DEFAULT_WEIGHT
    items.push({ text: translatedText, value: clampWeight(weight) })
  })
  return items
}

/**
 * Deduplicate cloud items by text value: keep one entry per unique string with the
 * maximum weight. Ensures the original phrase (value 12) is included and wins
 * when a translation equals it.
 */
export function deduplicateCloudDataByValue(
  items: TranslatorCloudWord[],
): TranslatorCloudWord[] {
  const byText = new Map<string, number>()
  for (const item of items) {
    const existing = byText.get(item.text)
    byText.set(item.text, Math.max(existing ?? 0, item.value))
  }
  return Array.from(byText.entries(), ([text, value]) => ({ text, value }))
}

type TranslatorCloudOptions = {
  minFontSize: number
  maxFontSize: number
  padding: number
  scale: FullTranslatorSearch['scale']
  spiral: FullTranslatorSearch['spiral']
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
    spiral: formState.spiral,
    rotationAngles: [formState.rotationMin, formState.rotationMax],
    rotations: formState.rotations,
    deterministic: formState.deterministic,
    fontFamily: formState.fontFamily,
    randomSeed: 'translator',
  }
}
