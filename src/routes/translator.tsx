import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
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

export const Route = createFileRoute('/translator')({
  ssr: false,
  component: TranslatorWordCloudPage,
})

const translatorOptionsDefaults = {
  maxWords: 1000,
  minFontSize: 14,
  maxFontSize: 72,
  padding: 1,
  scale: 'sqrt' as ScaleType,
  rotationAngles: [-90, 90] as [number, number],
  rotations: 2,
  deterministic: true,
  fontFamily: DEFAULT_FONT_FAMILY,
  backgroundColor: TRANSLATOR_BG,
  colors: [TRANSLATOR_TEXT_COLOR] as string[],
}

function TranslatorWordCloudPage() {
  const [input, setInput] = useState('everything will be great')
  const [translations, setTranslations] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [options, setOptions] = useState(translatorOptionsDefaults)

  useEffect(() => {
    setMounted(true)
  }, [])

  const runTranslate = useCallback(async () => {
    const text = input.trim()
    if (!text) {
      setError('Enter some text to translate.')
      return
    }

    setError(null)
    setLoading(true)
    setTranslations(new Map())

    const result = await getOrTranslatePhrase({
      data: { phrase: text, sourceLanguage: 'en' },
    })

    if (result.ok) {
      setTranslations(new Map(Object.entries(result.translations)))
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [input])

  const cloudDataRaw = useMemo(() => {
    const text = input.trim()
    if (!text && translations.size === 0) return []

    const items: { text: string; value: number }[] = []
    // English original is the biggest (max value); translations get smaller random values
    if (text) {
      items.push({ text, value: 1000 })
    }
    translations.forEach((translated, _lang) => {
      items.push({ text: translated, value: Math.floor(Math.random() * 80) + 1 })
    })
    return items
  }, [input, translations])

  const cloudData =cloudDataRaw;

  const hasWords = cloudData.length > 0

  const palette =
    options.colors.filter((c: string) => /^#[0-9A-Fa-f]{6}$/.test(c)).length > 0
      ? options.colors.filter((c: string) => /^#[0-9A-Fa-f]{6}$/.test(c))
      : DEFAULT_COLORS

  const cloudOptions = useMemo(
    () => ({
      minFontSize: options.minFontSize,
      maxFontSize: options.maxFontSize,
      padding: options.padding,
      scale: options.scale,
      rotationAngles: options.rotationAngles,
      rotations: options.rotations,
      deterministic: options.deterministic,
      fontFamily: options.fontFamily,
      randomSeed: 'translator',
    }),
    [
      options.minFontSize,
      options.maxFontSize,
      options.padding,
      options.scale,
      options.rotationAngles,
      options.rotations,
      options.deterministic,
      options.fontFamily,
    ],
  )

  return (
    <main className="page-wrap py-8 sm:py-12">
      <PageHero
        kicker="Translator"
        title="Multi-language word cloud"
        description="Enter a phrase and translate it into many languages, then see it as a word cloud."
      />

      <div className="rise-in mt-10 grid gap-8 lg:grid-cols-[1fr,1.2fr] lg:items-start">
        <section className="island-shell rounded-2xl p-5 sm:p-6 space-y-5">
          <Accordion title="Phrase to translate" defaultOpen>
            <div>
              <label
                htmlFor="translator-input"
                className="mb-2 block text-sm font-semibold text-sea-ink"
              >
                Phrase to translate
              </label>
              <input
                id="translator-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. everything will be great"
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
              {loading ? 'Translating…' : 'Translate & show word cloud'}
            </button>

            {translations.size > 0 && !loading && (
              <p className="mt-2 text-sm text-sea-ink-soft">
                {translations.size} translation{translations.size !== 1 ? 's' : ''} ran.
              </p>
            )}
          </Accordion>

          <Accordion title="Word cloud options">
            <WordCloudOptions
              maxWords={options.maxWords}
              onMaxWordsChange={(v) => setOptions((o) => ({ ...o, maxWords: v }))}
              padding={options.padding}
              onPaddingChange={(v) => setOptions((o) => ({ ...o, padding: v }))}
              minFontSize={options.minFontSize}
              onMinFontSizeChange={(v) => setOptions((o) => ({ ...o, minFontSize: v }))}
              maxFontSize={options.maxFontSize}
              onMaxFontSizeChange={(v) => setOptions((o) => ({ ...o, maxFontSize: v }))}
              scale={options.scale}
              onScaleChange={(v) => setOptions((o) => ({ ...o, scale: v }))}
              rotationAngles={options.rotationAngles}
              onRotationAnglesChange={(v) =>
                setOptions((o) => ({ ...o, rotationAngles: v }))
              }
              rotations={options.rotations}
              onRotationsChange={(v) =>
                setOptions((o) => ({ ...o, rotations: v }))
              }
              deterministic={options.deterministic}
              onDeterministicChange={(v) =>
                setOptions((o) => ({ ...o, deterministic: v }))
              }
              fontFamily={options.fontFamily}
              onFontFamilyChange={(v) =>
                setOptions((o) => ({ ...o, fontFamily: v }))
              }
              backgroundColor={options.backgroundColor}
              onBackgroundColorChange={(v) =>
                setOptions((o) => ({ ...o, backgroundColor: v }))
              }
              colors={options.colors}
              onColorsChange={(v) => setOptions((o) => ({ ...o, colors: v }))}
            />
          </Accordion>
        </section>

        <WordCloudCanvas
          words={cloudData}
          palette={palette}
          backgroundColor={options.backgroundColor}
          mounted={mounted}
          hasWords={hasWords}
          options={cloudOptions}
        />
      </div>
    </main>
  )
}
