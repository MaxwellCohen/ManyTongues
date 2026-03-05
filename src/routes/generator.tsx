import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import seedrandom from 'seedrandom'
import { z } from 'zod'
import PageHero from '#/components/PageHero'
import WordCloudCanvas from '#/components/WordCloudCanvas'
import WordCloudOptions from '#/components/WordCloudOptions'
import { useWordCloudLayout } from '#/hooks/useWordCloudLayout'
import {
  DEFAULT_BG,
  DEFAULT_COLORS,
  DEFAULT_TEXT,
  tokenizeAndCount,
  type CloudWord,
} from '#/lib/wordCloudUtils'

const scaleOptions = ['linear', 'sqrt', 'log'] as const

const generatorSearchSchema = z.object({
  input: z.string().optional(),
  maxWords: z.coerce.number().int().min(1).max(500).optional(),
  minFontSize: z.coerce.number().int().min(1).max(200).optional(),
  maxFontSize: z.coerce.number().int().min(1).max(200).optional(),
  padding: z.coerce.number().int().min(0).max(20).optional(),
  scale: z.enum(scaleOptions).optional(),
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
  maxWords: 80,
  minFontSize: 14,
  maxFontSize: 72,
  padding: 2,
  scale: 'sqrt',
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

export const Route = createFileRoute('/generator')({
  ssr: false,
  validateSearch: zodValidator(generatorSearchSchema),
  component: WordCloudPage,
})

const textareaClass =
  'w-full resize-y rounded-xl border border-line bg-foam px-4 py-3 text-sea-ink placeholder:text-sea-ink-soft focus:border-lagoon focus:outline-none focus:ring-2 focus:ring-lagoon/30'

function WordCloudPage() {
  const navigate = useNavigate({ from: '/generator' })
  const searchFromUrl = Route.useSearch()
  const [mounted, setMounted] = useState(false)

  const [formState, setFormState] = useState<FullGeneratorSearch>(() => ({
    ...DEFAULT_GENERATOR_SEARCH,
    ...searchFromUrl,
  } as FullGeneratorSearch))
  const formStateRef = useRef<FullGeneratorSearch>(formState)
  formStateRef.current = formState
  const hasChangedSinceLastSyncRef = useRef(false)

  // When URL search changes (e.g. initial load, back/forward), merge only URL params into form state
  useEffect(() => {
    const urlUpdates: Partial<GeneratorSearch> = {}
    const keys = Object.keys(DEFAULT_GENERATOR_SEARCH) as (keyof GeneratorSearch)[]
    for (const k of keys) {
      const v = searchFromUrl[k]
      if (v !== undefined) (urlUpdates as Record<keyof GeneratorSearch, unknown>)[k] = v
    }
    setFormState((prev) => ({ ...prev, ...urlUpdates } as FullGeneratorSearch))
    hasChangedSinceLastSyncRef.current = false
  }, [
    searchFromUrl.input,
    searchFromUrl.maxWords,
    searchFromUrl.minFontSize,
    searchFromUrl.maxFontSize,
    searchFromUrl.padding,
    searchFromUrl.scale,
    searchFromUrl.backgroundColor,
    (searchFromUrl.colors ?? []).join(','),
  ])

  const syncToUrlOnBlur = useCallback(() => {
    if (!hasChangedSinceLastSyncRef.current) return
    hasChangedSinceLastSyncRef.current = false
    const nextSearch = getSearchForUrl(formStateRef.current)
    const search = { ...searchFromUrl, ...nextSearch } as Partial<GeneratorSearch>
    navigate({ to: '/generator', search, replace: true })
  }, [navigate, searchFromUrl])

  const setSearch = useCallback((updates: Partial<FullGeneratorSearch>) => {
    hasChangedSinceLastSyncRef.current = true
    setFormState((prev) => ({ ...prev, ...updates }))
  }, [])

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

  const fontSize = useCallback(
    (word: { value: number }) => {
      if (cloudData.length === 0) return minFontSize
      const values = cloudData.map((w: { text: string; value: number }) => w.value)
      const minV = Math.min(...values)
      const maxV = Math.max(...values)
      const range = maxV - minV || 1
      let t: number
      switch (scale) {
        case 'log': {
          const logMin = Math.log(minV + 1)
          const logMax = Math.log(maxV + 1)
          const logRange = logMax - logMin || 1
          t = Math.log(word.value + 1)
          return (
            ((t - logMin) / logRange) * (maxFontSize - minFontSize) +
            minFontSize
          )
        }
        case 'sqrt':
          t = Math.sqrt(word.value)
          return (
            ((t - Math.sqrt(minV)) / (Math.sqrt(maxV) - Math.sqrt(minV))) *
              (maxFontSize - minFontSize) +
            minFontSize
          )
        default:
          return (
            ((word.value - minV) / range) * (maxFontSize - minFontSize) +
            minFontSize
          )
      }
    },
    [cloudData, scale, minFontSize, maxFontSize],
  )

  const random = useMemo(() => seedrandom(`${scale}-42`), [scale])

  const rotate = useCallback(
    (_: { text: string; value: number }, i: number) =>
      i % 2 === 0 ? -90 : 0,
    [],
  )

  const laidOutWords = useWordCloudLayout(cloudData, {
    fontSize,
    padding,
    rotate,
    random,
  })

  const [tooltip, setTooltip] = useState<string | null>(null)
  const onWordMouseOver = useCallback(
    (word: CloudWord) => setTooltip(`${word.text} (${word.value})`),
    [],
  )
  const onWordMouseOut = useCallback(() => setTooltip(null), [])

  return (
    <main className="page-wrap py-8 sm:py-12">
      <PageHero />

      <div className="rise-in mt-10 grid gap-8 lg:grid-cols-[1fr,1.2fr] lg:items-start">
        <section className="island-shell rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <label
              htmlFor="wordcloud-input"
              className="mb-2 block text-sm font-semibold text-sea-ink"
            >
              Your text
            </label>
            <textarea
              id="wordcloud-input"
              value={input}
              onChange={(e) => setSearch({ input: e.target.value })}
              onBlur={syncToUrlOnBlur}
              placeholder="Paste or type here…"
              rows={10}
              className={textareaClass}
            />
          </div>

          <WordCloudOptions
            maxWords={maxWords}
            onMaxWordsChange={(v) => setSearch({ maxWords: v })}
            padding={padding}
            onPaddingChange={(v) => setSearch({ padding: v })}
            minFontSize={minFontSize}
            onMinFontSizeChange={(v) => setSearch({ minFontSize: v })}
            maxFontSize={maxFontSize}
            onMaxFontSizeChange={(v) => setSearch({ maxFontSize: v })}
            scale={scale}
            onScaleChange={(v) => setSearch({ scale: v })}
            backgroundColor={backgroundColor}
            onBackgroundColorChange={(v) => setSearch({ backgroundColor: v })}
            colors={colors}
            onColorsChange={(v) => setSearch({ colors: v })}
            onBlur={syncToUrlOnBlur}
          />
        </section>

        <WordCloudCanvas
          laidOutWords={laidOutWords}
          palette={palette}
          backgroundColor={backgroundColor}
          mounted={mounted}
          hasWords={hasWords}
          tooltip={tooltip}
          onWordMouseOver={onWordMouseOver}
          onWordMouseOut={onWordMouseOut}
        />
      </div>
    </main>
  )
}
