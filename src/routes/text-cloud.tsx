import { useMachine } from '@xstate/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import PageHero from '#/components/PageHero'
import WordCloudCanvas from '#/components/WordCloudCanvas'
import WordCloudOptions from '#/components/WordCloudOptions'
import { createTextCloudMachine } from '#/features/word-cloud/textCloudMachine'
import {
  generatorScaleOptions,
  getGeneratorPalette,
  resolveGeneratorSearch,
} from '#/features/word-cloud/textCloudState'
import { tokenizeAndCount } from '#/lib/wordCloudUtils'
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
  scale: z.enum(generatorScaleOptions).optional(),
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
  const resolvedSearch = useMemo(
    () => resolveGeneratorSearch(searchFromUrl),
    [searchFromUrl],
  )
  const [machine] = useState(() => createTextCloudMachine(resolvedSearch))
  const [snapshot, send] = useMachine(machine)

  useEffect(() => {
    send({ type: 'URL_CHANGED', search: resolvedSearch })
  }, [resolvedSearch, send])

  useEffect(() => {
    const pendingUrlSearch = snapshot.context.pendingUrlSearch
    if (!pendingUrlSearch) return

    navigate({
      to: '/text-cloud',
      search: pendingUrlSearch,
      replace: true,
    })
    send({ type: 'URL_COMMITTED' })
  }, [navigate, send, snapshot.context.pendingUrlSearch])

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
  } = snapshot.context.formState

  const words = useMemo(() => tokenizeAndCount(input), [input])
  const cloudData = useMemo(
    () => words.slice(0, maxWords),
    [words, maxWords],
  )
  const hasWords = words.length > 0

  const palette = useMemo(() => getGeneratorPalette(colors), [colors])

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
              onChange={(e) =>
                send({ type: 'FIELD_CHANGED', updates: { input: e.target.value } })
              }
              onBlur={() => send({ type: 'COMMIT_TO_URL' })}
              placeholder="Paste text, notes, a transcript, or lyrics..."
              rows={10}
              className={textareaClass}
            />
          </div>

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
