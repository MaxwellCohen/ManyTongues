import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import PageHero from '#/components/PageHero'
import WordCloudCanvas from '#/components/WordCloudCanvas'
import WordCloudOptions from '#/components/WordCloudOptions'
import {
  DEFAULT_BG,
  DEFAULT_COLORS,
  DEFAULT_FONT_FAMILY,
  DEFAULT_TEXT,
  tokenizeAndCount,
} from '#/lib/wordCloudUtils'

const scaleOptions = ['linear', 'sqrt', 'log'] as const
const booleanSearchParam = z.preprocess((value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}, z.boolean())

const generatorSearchSchema = z.object({
  input: z.string().optional(),
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
  colors: z
    .preprocess(
      (val) =>
        typeof val === 'string'
          ? val.split(',').map((s) => s.trim()).filter(Boolean)
          : val,
      z.array(z.string()),
    )
    .optional(),
  backgroundColor: z.string().optional(),
})

export type GeneratorSearch = z.infer<typeof generatorSearchSchema>

/** Full form state (all keys required); defaults for the generator route. */
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

/** Only keys that differ from defaults (for a clean URL) */
function getSearchForUrl(state: FullGeneratorSearch): Partial<GeneratorSearch> {
  const out: Partial<GeneratorSearch> = {}
  const keys = Object.keys(DEFAULT_GENERATOR_SEARCH) as (keyof FullGeneratorSearch)[]
  for (const k of keys) {
    const a = state[k]
    const b = DEFAULT_GENERATOR_SEARCH[k]
    if (Array.isArray(a) && Array.isArray(b)) {
      if (
        a.length !== b.length ||
        a.some((v, i) => v !== b[i])
      )
        (out as Record<keyof GeneratorSearch, unknown>)[k] = a
    } else if (a !== b) {
      (out as Record<keyof GeneratorSearch, unknown>)[k] = a
    }
  }
  return out
}

export const Route = createFileRoute('/text-cloud')({
  ssr: false,
  validateSearch: zodValidator(generatorSearchSchema),
  head: () => ({
    meta: [
      {
        title: 'Text Cloud | ManyTongues',
      },
    ],
  }),
  component: WordCloudPage,
})

const textareaClass =
  'w-full resize-y rounded-xl border border-line bg-foam px-4 py-3 text-sea-ink placeholder:text-sea-ink-soft focus:border-lagoon focus:outline-none focus:ring-2 focus:ring-lagoon/30'

function WordCloudPage() {
  const navigate = useNavigate({ from: '/text-cloud' })
  const searchFromUrl = Route.useSearch()
  const [mounted, setMounted] = useState(false)

  const [formState, setFormState] = useState<FullGeneratorSearch>(() => ({
    ...DEFAULT_GENERATOR_SEARCH,
    ...searchFromUrl,
  } as FullGeneratorSearch))
  const formStateRef = useRef<FullGeneratorSearch>(formState)
  const hasChangedSinceLastSyncRef = useRef(false)

  useEffect(() => {
    formStateRef.current = formState
  }, [formState])

  const applyFormUpdates = useCallback(
    (
      updates:
        | Partial<FullGeneratorSearch>
        | ((prev: FullGeneratorSearch) => Partial<FullGeneratorSearch>),
    ) => {
      const prev = formStateRef.current
      const partial = typeof updates === 'function' ? updates(prev) : updates
      const nextState = { ...prev, ...partial }
      formStateRef.current = nextState
      hasChangedSinceLastSyncRef.current = true
      setFormState(nextState)
    },
    [],
  )

  // When URL search changes (e.g. initial load, back/forward), merge only URL params into form state
  useEffect(() => {
    const nextState = {
      ...DEFAULT_GENERATOR_SEARCH,
      ...searchFromUrl,
      colors: searchFromUrl.colors ?? DEFAULT_GENERATOR_SEARCH.colors,
    } as FullGeneratorSearch
    formStateRef.current = nextState
    setFormState(nextState)
    hasChangedSinceLastSyncRef.current = false
  }, [
    searchFromUrl.input,
    searchFromUrl.maxWords,
    searchFromUrl.minFontSize,
    searchFromUrl.maxFontSize,
    searchFromUrl.padding,
    searchFromUrl.scale,
    searchFromUrl.rotationMin,
    searchFromUrl.rotationMax,
    searchFromUrl.rotations,
    searchFromUrl.deterministic,
    searchFromUrl.fontFamily,
    searchFromUrl.backgroundColor,
    (searchFromUrl.colors ?? []).join(','),
  ])

  const syncToUrlOnBlur = useCallback(() => {
    if (!hasChangedSinceLastSyncRef.current) return
    hasChangedSinceLastSyncRef.current = false
    const nextSearch = getSearchForUrl(formStateRef.current)
    navigate({ to: '/text-cloud', search: nextSearch, replace: true })
  }, [navigate])

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    input,
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
    colors,
    backgroundColor,
  } = formState

  const words = useMemo(() => tokenizeAndCount(input), [input])
  const cloudData = useMemo(
    () => words.slice(0, maxWords),
    [words, maxWords],
  )
  const hasWords = words.length > 0

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
      maxWords,
      rotationAngles: [rotationMin, rotationMax] as [number, number],
      rotations,
      deterministic,
      fontFamily,
      randomSeed: `${scale}-42`,
    }),
    [
      minFontSize,
      maxFontSize,
      padding,
      scale,
      maxWords,
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
        kicker="Text Cloud"
        title="Build a word cloud from any text"
        description="Paste text, adjust the layout and colors, then export a clean word cloud image."
      />

      <div className="rise-in mt-10 grid gap-8 lg:grid-cols-[1fr,1.2fr] lg:items-start">
        <section className="island-shell rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <label
              htmlFor="wordcloud-input"
              className="mb-2 block text-sm font-semibold text-sea-ink"
            >
              Source text
            </label>
            <textarea
              id="wordcloud-input"
              value={input}
              onChange={(e) => applyFormUpdates({ input: e.target.value })}
              onBlur={syncToUrlOnBlur}
              placeholder="Paste text, notes, a transcript, or lyrics..."
              rows={10}
              className={textareaClass}
            />
          </div>

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
            onDeterministicChange={(v) => applyFormUpdates({ deterministic: v })}
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
        </section>

        <WordCloudCanvas
          words={cloudData}
          palette={palette}
          backgroundColor={backgroundColor}
          mounted={mounted}
          hasWords={hasWords}
          options={cloudOptions}
        />
      </div>
    </main>
  )
}
