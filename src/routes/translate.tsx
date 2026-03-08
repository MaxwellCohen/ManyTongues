import { useMachine } from '@xstate/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import Accordion from '#/components/Accordion'
import PageHero from '#/components/PageHero'
import WordCloudCanvas from '#/components/WordCloudCanvas'
import WordCloudOptions from '#/components/WordCloudOptions'
import { createTranslateMachine } from '#/features/word-cloud/translateMachine'
import {
  clampWeight,
  DEFAULT_WEIGHT,
  getTranslatorPalette,
  parseWeights,
  resolveTranslatorSearch,
  translatorScaleOptions,
  WEIGHT_MAX,
  WEIGHT_MIN,
} from '#/features/word-cloud/translateState'
import { getOrTranslatePhrase } from '#/lib/translate'
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
  scale: z.enum(translatorScaleOptions).optional(),
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

function TranslatorWordCloudPage() {
  const navigate = useNavigate({ from: '/translate' })
  const searchFromUrl = Route.useSearch()
  const resolvedSearch = useMemo(
    () => resolveTranslatorSearch(searchFromUrl),
    [searchFromUrl],
  )
  const [machine] = useState(() =>
    createTranslateMachine({
      initialSearch: resolvedSearch,
      translatePhrase: async (phrase) =>
        getOrTranslatePhrase({ data: { phrase } }),
    }),
  )
  const [snapshot, send] = useMachine(machine)

  useEffect(() => {
    send({ type: 'URL_CHANGED', search: resolvedSearch })
  }, [resolvedSearch, send])

  useEffect(() => {
    const pendingUrlSearch = snapshot.context.pendingUrlSearch
    if (!pendingUrlSearch) return

    navigate({
      to: '/translate',
      search: pendingUrlSearch,
      replace: true,
    })
    send({ type: 'URL_COMMITTED' })
  }, [navigate, send, snapshot.context.pendingUrlSearch])

  const hiddenLanguages = useMemo(
    () => new Set(snapshot.context.formState.hiddenLanguages),
    [snapshot.context.formState.hiddenLanguages],
  )
  const weights = useMemo(
    () => parseWeights(snapshot.context.formState.weights),
    [snapshot.context.formState.weights],
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
  } = snapshot.context.formState

  const translations = snapshot.context.translations
  const loading = snapshot.matches('translating')
  const error = snapshot.context.error

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

  const palette = useMemo(() => getTranslatorPalette(colors), [colors])

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
                onChange={(e) =>
                  send({
                    type: 'FIELD_CHANGED',
                    updates: { input: e.target.value },
                  })
                }
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  send({ type: 'TRANSLATE_REQUESTED' })
                }}
                onBlur={() => send({ type: 'COMMIT_TO_URL' })}
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
              onClick={() => send({ type: 'TRANSLATE_REQUESTED' })}
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
                        onChange={(e) => {
                          send({
                            type: 'WEIGHT_CHANGED',
                            lang,
                            value: Number(e.target.value),
                          })
                        }}
                        onBlur={() => send({ type: 'COMMIT_TO_URL' })}
                        className="h-2 w-24 shrink-0 rounded-full bg-line accent-lagoon"
                      />
                      <span className="w-8 tabular-nums">
                        {weights.get(lang) ?? DEFAULT_WEIGHT}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        send({
                          type: 'LANGUAGE_HIDDEN',
                          lang,
                        })
                      }
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
              onMaxWordsChange={(v) =>
                send({ type: 'FIELD_CHANGED', updates: { maxWords: v } })
              }
              padding={padding}
              onPaddingChange={(v) =>
                send({ type: 'FIELD_CHANGED', updates: { padding: v } })
              }
              minFontSize={minFontSize}
              onMinFontSizeChange={(v) =>
                send({ type: 'FIELD_CHANGED', updates: { minFontSize: v } })
              }
              maxFontSize={maxFontSize}
              onMaxFontSizeChange={(v) =>
                send({ type: 'FIELD_CHANGED', updates: { maxFontSize: v } })
              }
              scale={scale}
              onScaleChange={(v) =>
                send({ type: 'FIELD_CHANGED', updates: { scale: v } })
              }
              rotationAngles={[rotationMin, rotationMax]}
              onRotationAnglesChange={(v) =>
                send({
                  type: 'FIELD_CHANGED',
                  updates: {
                    rotationMin: v[0],
                    rotationMax: v[1],
                  },
                })
              }
              rotations={rotations}
              onRotationsChange={(v) =>
                send({ type: 'FIELD_CHANGED', updates: { rotations: v } })
              }
              deterministic={deterministic}
              onDeterministicChange={(v) =>
                send({ type: 'FIELD_CHANGED', updates: { deterministic: v } })
              }
              fontFamily={fontFamily}
              onFontFamilyChange={(v) =>
                send({ type: 'FIELD_CHANGED', updates: { fontFamily: v } })
              }
              backgroundColor={backgroundColor}
              onBackgroundColorChange={(v) =>
                send({ type: 'FIELD_CHANGED', updates: { backgroundColor: v } })
              }
              colors={colors}
              onColorsChange={(v) =>
                send({ type: 'FIELD_CHANGED', updates: { colors: v } })
              }
              onCommit={() => send({ type: 'COMMIT_TO_URL' })}
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
