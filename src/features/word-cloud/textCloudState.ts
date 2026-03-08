import {
  DEFAULT_BG,
  DEFAULT_COLORS,
  DEFAULT_FONT_FAMILY,
  DEFAULT_TEXT,
} from '#/lib/wordCloudUtils'
import { getSearchDiffFromDefaults, getValidPalette, mergeSearchWithDefaults } from './search'

export const generatorScaleOptions = ['linear', 'sqrt', 'log'] as const

export type GeneratorSearch = {
  input?: string
  maxWords?: number
  minFontSize?: number
  maxFontSize?: number
  padding?: number
  scale?: (typeof generatorScaleOptions)[number]
  rotationMin?: number
  rotationMax?: number
  rotations?: number
  deterministic?: boolean
  fontFamily?: string
  colors?: string[]
  backgroundColor?: string
}

export type FullGeneratorSearch = Required<GeneratorSearch>

export const DEFAULT_GENERATOR_SEARCH: FullGeneratorSearch = {
  input: DEFAULT_TEXT,
  maxWords: 1000,
  minFontSize: 14,
  maxFontSize: 72,
  padding: 1,
  scale: 'sqrt',
  rotationMin: -90,
  rotationMax: 0,
  rotations: 2,
  deterministic: true,
  fontFamily: DEFAULT_FONT_FAMILY,
  colors: [...DEFAULT_COLORS],
  backgroundColor: DEFAULT_BG,
}

const generatorArrayKeys = ['colors'] as const satisfies readonly (keyof FullGeneratorSearch)[]

export function resolveGeneratorSearch(
  search: GeneratorSearch,
): FullGeneratorSearch {
  return mergeSearchWithDefaults(
    DEFAULT_GENERATOR_SEARCH,
    search,
    generatorArrayKeys,
  )
}

export function getGeneratorSearchForUrl(
  state: FullGeneratorSearch,
): Partial<GeneratorSearch> {
  return getSearchDiffFromDefaults(state, DEFAULT_GENERATOR_SEARCH)
}

export function getGeneratorPalette(colors: string[]): string[] {
  return getValidPalette(colors, DEFAULT_COLORS)
}
