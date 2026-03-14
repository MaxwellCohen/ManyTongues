import {
  DEFAULT_BG,
  DEFAULT_COLORS,
  DEFAULT_FONT_FAMILY,
  DEFAULT_TEXT,
  type SpiralType,
} from '#/lib/wordCloudUtils'
import { getSearchDiffFromDefaults, getValidPalette, mergeSearchWithDefaults } from './search'

export const generatorScaleOptions = ['linear', 'sqrt', 'log'] as const
export const generatorSpiralOptions = ['archimedean', 'rectangular'] as const

export type GeneratorSearch = {
  input?: string
  minFontSize?: number
  maxFontSize?: number
  padding?: number
  scale?: (typeof generatorScaleOptions)[number]
  spiral?: (typeof generatorSpiralOptions)[number]
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
  minFontSize: 14,
  maxFontSize: 72,
  padding: 1,
  scale: 'sqrt',
  spiral: 'archimedean' as SpiralType,
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
