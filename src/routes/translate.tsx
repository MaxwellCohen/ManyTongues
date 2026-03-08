import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import Accordion from '#/components/Accordion'
import PageHero from '#/components/PageHero'
import WordCloudCanvas from '#/components/WordCloudCanvas'
import WordCloudOptions from '#/components/WordCloudOptions'
import {
  DEFAULT_COLORS,
  DEFAULT_FONT_FAMILY,
} from '#/lib/wordCloudUtils'
import type { ScaleType } from '#/lib/wordCloudUtils'
import { getOrTranslatePhrase } from '#/lib/translate'

/** Mustard / dark yellow background and black text to match reference word cloud. */
const TRANSLATOR_BG = '#c9a227'
const TRANSLATOR_TEXT_COLOR = '#000000'
const scaleOptions = ['linear', 'sqrt', 'log'] as const
const booleanSearchParam = z.preprocess((value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}, z.boolean())

const translatorSearchSchema = z.object({
  input: z.string().optional(),
  translated: booleanSearchParam.optional(),
  maxWords: z.coerce.number().int().min(1).max(1000).optional(),
  minFontSize: z.coerce.number().int().min(1).max(200).optional(),
  maxFontSize: z.coerce.number().int().min(1).max(200).optional(),
  padding: z.coerce.number().int().min(0).max(20).optional(),
  scale: z.enum(scaleOptions).optional(),
  rotationMin: z.coerce.number().int().min(-360).max(360).optional(),
  rotationMax: z.coerce.number().int().min(-360).max(360).optional(),
  rotations: z.coerce.number().int().min(0).max(12).optional(),
  deterministic: booleanSearchParam.optional(),
  fontFamily: z.string().optional(),
  backgroundColor: z.string().optional(),
  colors: z
    .preprocess(
      (value) =>
        typeof value === 'string'
          ? value.split(',').map((part) => part.trim()).filter(Boolean)
          : value,
      z.array(z.string()),
    )
    .optional(),
  hiddenLanguages: z
    .preprocess(
      (value) =>
        typeof value === 'string'
          ? value.split(',').map((part) => part.trim()).filter(Boolean)
          : value,
      z.array(z.string()),
    )
    .optional(),
  weights: z.string().optional(),
})

export const Route = createFileRoute('/translate')({
  ssr: false,
  validateSearch: zodValidator(translatorSearchSchema),
  head: () => ({
    meta: [
      {
        title: 'Translate | ManyTongues',
      },
    ],
  }),
  component: TranslatorWordCloudPage,
})

type TranslatorSearch = z.infer<typeof translatorSearchSchema>
type FullTranslatorSearch = Required<TranslatorSearch>

const DEFAULT_TRANSLATOR_SEARCH: FullTranslatorSearch = {
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
  colors: [TRANSLATOR_TEXT_COLOR] as string[],
  hiddenLanguages: [],
  weights: '',
}

const DEFAULT_WEIGHT = 50
const WEIGHT_MIN = 1
const WEIGHT_MAX = 200

function clampWeight(value: number): number {
  return Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, Math.round(Number(value) || DEFAULT_WEIGHT)))
}

function parseWeights(value: string): Map<string, number> {
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

function serializeWeights(weights: Map<string, number>): string {
  return Array.from(weights.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([lang, weight]) => `${lang}:${clampWeight(weight)}`)
    .join(',')
}

function createRandomWeights(languages: Iterable<string>): Map<string, number> {
  const weights = new Map<string, number>()
  for (const lang of languages) {
    weights.set(lang, Math.floor(Math.random() * WEIGHT_MAX) + WEIGHT_MIN)
  }
  return weights
}

function getSearchForUrl(state: FullTranslatorSearch): Partial<TranslatorSearch> {
  const out: Partial<TranslatorSearch> = {}
  const keys = Object.keys(DEFAULT_TRANSLATOR_SEARCH) as (keyof FullTranslatorSearch)[]
  for (const key of keys) {
    const nextValue = state[key]
    const defaultValue = DEFAULT_TRANSLATOR_SEARCH[key]
    if (Array.isArray(nextValue) && Array.isArray(defaultValue)) {
      if (
        nextValue.length !== defaultValue.length ||
        nextValue.some((value, index) => value !== defaultValue[index])
      ) {
        ;(out as Record<keyof TranslatorSearch, unknown>)[key] = nextValue
      }
    } else if (nextValue !== defaultValue) {
      ;(out as Record<keyof TranslatorSearch, unknown>)[key] = nextValue
    }
  }
  return out
}

function getResolvedTranslatorSearch(search: TranslatorSearch): FullTranslatorSearch {
  return {
    ...DEFAULT_TRANSLATOR_SEARCH,
    ...search,
    colors: search.colors ?? DEFAULT_TRANSLATOR_SEARCH.colors,
    hiddenLanguages: search.hiddenLanguages ?? DEFAULT_TRANSLATOR_SEARCH.hiddenLanguages,
  }
}

function TranslatorWordCloudPage() {
  const navigate = useNavigate({ from: '/translate' })
  const searchFromUrl = Route.useSearch()
  const resolvedSearch = useMemo(
    () => getResolvedTranslatorSearch(searchFromUrl),
    [searchFromUrl],
  )
  const [formState, setFormState] = useState<FullTranslatorSearch>(() => resolvedSearch)
  const formStateRef = useRef<FullTranslatorSearch>(formState)
  const hasChangedSinceLastSyncRef = useRef(false)
  const loadedPhraseRef = useRef<string | null>(null)
  const [translations, setTranslations] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const applyFormUpdates = useCallback(
    (
      updates:
        | Partial<FullTranslatorSearch>
        | ((prev: FullTranslatorSearch) => Partial<FullTranslatorSearch>),
      syncImmediately = false,
    ) => {
      const prev = formStateRef.current
      const partial = typeof updates === 'function' ? updates(prev) : updates
      const nextState = { ...prev, ...partial }
      formStateRef.current = nextState
      setFormState(nextState)

      if (syncImmediately) {
        hasChangedSinceLastSyncRef.current = false
        navigate({
          to: '/translate',
          search: getSearchForUrl(nextState),
          replace: true,
        })
        return
      }

      hasChangedSinceLastSyncRef.current = true
    },
    [navigate],
  )

  const syncToUrlOnBlur = useCallback(() => {
    if (!hasChangedSinceLastSyncRef.current) return
    hasChangedSinceLastSyncRef.current = false
    navigate({
      to: '/translate',
      search: getSearchForUrl(formStateRef.current),
      replace: true,
    })
  }, [navigate])

  useEffect(() => {
    const nextState = resolvedSearch
    formStateRef.current = nextState
    setFormState(nextState)
    hasChangedSinceLastSyncRef.current = false
  }, [resolvedSearch])

  useEffect(() => {
    const phrase = resolvedSearch.input.trim()
    const shouldLoadTranslations = Boolean(resolvedSearch.translated && phrase)
    if (!shouldLoadTranslations) {
      loadedPhraseRef.current = null
      setTranslations(new Map())
      setLoading(false)
      setError(null)
      return
    }

    if (loadedPhraseRef.current === phrase) return

    let cancelled = false
    setLoading(true)
    setError(null)

    getOrTranslatePhrase({ data: { phrase } }).then((result) => {
      if (cancelled) return

      if (result.ok) {
        loadedPhraseRef.current = phrase
        setTranslations(new Map(Object.entries(result.translations)))
        setError(null)
      } else {
        loadedPhraseRef.current = null
        setTranslations(new Map())
        setError(result.error)
      }

      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [resolvedSearch.input, resolvedSearch.translated])

  const runTranslate = useCallback(async () => {
    const text = formStateRef.current.input.trim()
    if (!text) {
      setError('Enter some text to translate.')
      setTranslations(new Map())
      loadedPhraseRef.current = null
      applyFormUpdates({ translated: false }, true)
      return
    }

    setError(null)
    setLoading(true)
    setTranslations(new Map())
    loadedPhraseRef.current = null

    const result = await getOrTranslatePhrase({
      data: { phrase: text },
    })

    if (result.ok) {
      const nextTranslations = new Map(Object.entries(result.translations))
      const nextWeights = createRandomWeights(nextTranslations.keys())

      const nextHiddenLanguages = formStateRef.current.hiddenLanguages.filter((lang) =>
        nextTranslations.has(lang),
      )

      loadedPhraseRef.current = text
      setTranslations(nextTranslations)
      applyFormUpdates(
        {
          input: text,
          translated: true,
          weights: serializeWeights(nextWeights),
          hiddenLanguages: nextHiddenLanguages,
        },
        true,
      )
    } else {
      setError(result.error)
      setTranslations(new Map())
      applyFormUpdates({ translated: false }, true)
    }

    setLoading(false)
  }, [applyFormUpdates])

  const hiddenLanguages = useMemo(
    () => new Set(formState.hiddenLanguages),
    [formState.hiddenLanguages],
  )
  const weights = useMemo(() => parseWeights(formState.weights), [formState.weights])

  const removeTranslation = useCallback(
    (lang: string) => {
      applyFormUpdates(
        (prev) => ({
          hiddenLanguages: prev.hiddenLanguages.includes(lang)
            ? prev.hiddenLanguages
            : [...prev.hiddenLanguages, lang],
        }),
        true,
      )
    },
    [applyFormUpdates],
  )

  const setWeight = useCallback(
    (lang: string, value: number) => {
      applyFormUpdates((prev) => {
        const nextWeights = parseWeights(prev.weights)
        nextWeights.set(lang, clampWeight(value))
        return { weights: serializeWeights(nextWeights) }
      })
    },
    [applyFormUpdates],
  )

  const {
    input,
    translated,
    maxWords,
    minFontSize,
    maxFontSize,
    padding,
    scale,
    rotationMin,
    rotationMax,
    rotations,
    deterministic,
    fontFamily,
    backgroundColor,
    colors,
  } = formState

  const cloudDataRaw = useMemo(() => {
    const phrase = input.trim()
    if (!translated || (!phrase && translations.size === 0)) return []

    const items: { text: string; value: number }[] = []
    if (phrase) {
      items.push({ text: phrase, value: 1000 })
    }
    translations.forEach((translated, lang) => {
      if (hiddenLanguages.has(lang)) return
      const weight = weights.get(lang) ?? DEFAULT_WEIGHT
      items.push({ text: translated, value: clampWeight(weight) })
    })
    return items
  }, [input, translated, translations, hiddenLanguages, weights])

  const cloudData = translated ? cloudDataRaw : []

  const hasWords = cloudData.length > 0

  const palette =
    colors.filter((c: string) => /^#[0-9A-Fa-f]{6}$/.test(c)).length > 0
      ? colors.filter((c: string) => /^#[0-9A-Fa-f]{6}$/.test(c))
      : DEFAULT_COLORS

  const cloudOptions = useMemo(
    () => ({
      minFontSize,
      maxFontSize,
      padding,
      scale,
      rotationAngles: [rotationMin, rotationMax] as [number, number],
      rotations,
      deterministic,
      fontFamily,
      randomSeed: 'translator',
    }),
    [
      minFontSize,
      maxFontSize,
      padding,
      scale,
      rotationMin,
      rotationMax,
      rotations,
      deterministic,
      fontFamily,
    ],
  )

  return (
    <main className="page-wrap py-8 sm:py-12">
      <PageHero
        kicker="Translate"
        title="Translate one phrase into a word cloud"
        description="Compare a short phrase across multiple languages, then adjust the cloud to highlight the translations that matter most."
      />

      <div className="rise-in mt-10 grid gap-8 lg:grid-cols-[1fr,1.2fr] lg:items-start">
        <section className="island-shell rounded-2xl p-5 sm:p-6 space-y-5">
          <Accordion title="Phrase" defaultOpen>
            <div>
              <label
                htmlFor="translator-input"
                className="mb-2 block text-sm font-semibold text-sea-ink"
              >
                Text to translate
              </label>
              <input
                id="translator-input"
                type="text"
                value={input}
                onChange={(e) => {
                  applyFormUpdates({
                    input: e.target.value,
                    translated: false,
                  })
                  loadedPhraseRef.current = null
                  setTranslations(new Map())
                  setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  void runTranslate()
                }}
                onBlur={syncToUrlOnBlur}
                placeholder="For example: everything will be great"
                className="w-full rounded-xl border border-line bg-foam px-4 py-3 text-sea-ink placeholder:text-sea-ink-soft focus:border-lagoon focus:outline-none focus:ring-2 focus:ring-lagoon/30"
              />
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={runTranslate}
              disabled={loading || !input.trim()}
              className="mt-3 w-full rounded-xl bg-lagoon px-4 py-3 text-sm font-semibold text-white hover:bg-lagoon/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Translating...' : 'Translate phrase'}
            </button>

            {translations.size > 0 && !loading && (
              <p className="mt-2 text-sm text-sea-ink-soft">
                {translations.size} translation{translations.size !== 1 ? 's are' : ' is'} ready.
              </p>
            )}
          </Accordion>

          {translations.size > 0 && (
            <Accordion title="Translations" defaultOpen>
              <p className="mb-3 text-sm text-sea-ink-soft">
                Remove languages or adjust the weight to control how large each translation appears in the cloud.
              </p>
              <ul className="space-y-3">
                {Array.from(translations.entries())
                  .filter(([lang]) => !hiddenLanguages.has(lang))
                  .map(([lang, text]) => (
                  <li
                    key={lang}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-foam p-3"
                  >
                    <span className="min-w-10 rounded bg-line/30 px-2 py-0.5 font-mono text-xs font-medium text-sea-ink">
                      {lang}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-sea-ink" title={text}>
                      {text}
                    </span>
                    <label className="flex items-center gap-1.5 text-sm text-sea-ink">
                      <span className="sr-only">Weight for {lang}</span>
                      <input
                        type="range"
                        min={WEIGHT_MIN}
                        max={WEIGHT_MAX}
                        value={weights.get(lang) ?? DEFAULT_WEIGHT}
                        onChange={(e) =>
                          setWeight(lang, Number(e.target.value))
                        }
                        onBlur={syncToUrlOnBlur}
                        className="h-2 w-24 shrink-0 rounded-full bg-line accent-lagoon"
                      />
                      <span className="w-8 tabular-nums">
                        {weights.get(lang) ?? DEFAULT_WEIGHT}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeTranslation(lang)}
                      className="rounded-lg border border-line px-2 py-1.5 text-xs font-medium text-sea-ink hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </Accordion>
          )}

          <Accordion title="Cloud styling">
            <WordCloudOptions
              maxWords={maxWords}
              onMaxWordsChange={(v) => applyFormUpdates({ maxWords: v })}
              padding={padding}
              onPaddingChange={(v) => applyFormUpdates({ padding: v })}
              minFontSize={minFontSize}
              onMinFontSizeChange={(v) => applyFormUpdates({ minFontSize: v })}
              maxFontSize={maxFontSize}
              onMaxFontSizeChange={(v) => applyFormUpdates({ maxFontSize: v })}
              scale={scale}
              onScaleChange={(v) => applyFormUpdates({ scale: v })}
              rotationAngles={[rotationMin, rotationMax]}
              onRotationAnglesChange={(v) =>
                applyFormUpdates({
                  rotationMin: v[0],
                  rotationMax: v[1],
                })
              }
              rotations={rotations}
              onRotationsChange={(v) => applyFormUpdates({ rotations: v })}
              deterministic={deterministic}
              onDeterministicChange={(v) =>
                applyFormUpdates({ deterministic: v })
              }
              fontFamily={fontFamily}
              onFontFamilyChange={(v) => applyFormUpdates({ fontFamily: v })}
              backgroundColor={backgroundColor}
              onBackgroundColorChange={(v) =>
                applyFormUpdates({ backgroundColor: v })
              }
              colors={colors}
              onColorsChange={(v) => applyFormUpdates({ colors: v })}
              onCommit={syncToUrlOnBlur}
            />
          </Accordion>
        </section>

        <WordCloudCanvas
          words={cloudData}
          palette={palette}
          backgroundColor={backgroundColor}
          mounted
          hasWords={hasWords}
          options={cloudOptions}
        />
      </div>
    </main>
  )
}
