import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import seedrandom from 'seedrandom'
import PageHero from '#/components/PageHero'
import WordCloudCanvas from '#/components/WordCloudCanvas'
import { useWordCloudLayout } from '#/hooks/useWordCloudLayout'
import { translateWithGoogle } from '#/lib/translate'

/** Mustard / dark yellow background and black text to match reference word cloud. */
const TRANSLATOR_BG = '#c9a227'
const TRANSLATOR_TEXT_COLOR = '#000000'

/** Target languages (BCP 47) for translation. */
const TARGET_LANGUAGES = [
  'it', // Italian
  'es', // Spanish
  'fr', // French
  'de', // German
  'pt', // Portuguese
  'ru', // Russian
  'uk', // Ukrainian
  'pl', // Polish
  'nl', // Dutch
  'sv', // Swedish
  'da', // Danish
  'el', // Greek
  'tr', // Turkish
  'hu', // Hungarian
  'ro', // Romanian
  'cs', // Czech
  'bg', // Bulgarian
  'vi', // Vietnamese
  'ja', // Japanese
  'ko', // Korean
  'zh', // Chinese
  'ar', // Arabic
  'he', // Hebrew
] as const

export const Route = createFileRoute('/translator')({
  ssr: false,
  component: TranslatorWordCloudPage,
})

function TranslatorWordCloudPage() {
  const [input, setInput] = useState('everything will be great')
  const [translations, setTranslations] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

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

    const settled = await Promise.allSettled(
      TARGET_LANGUAGES.map(async (target) => {
        const result = await translateWithGoogle({
          data: { text, targetLanguage: target, sourceLanguage: 'en' },
        })
        if (result.ok && result.translatedText?.trim()) {
          return { target, translated: result.translatedText.trim() }
        }
        return { target, error: result.ok ? undefined : result.error }
      }),
    )

    const results = new Map<string, string>()
    let firstError: string | null = null
    for (const outcome of settled) {
      if (outcome.status === 'rejected') {
        if (!firstError) firstError = outcome.reason?.message ?? String(outcome.reason)
        continue
      }
      const v = outcome.value
      if (v.translated) results.set(v.target, v.translated)
      else if (v.error && !firstError) firstError = v.error
    }
    if (results.size === 0 && firstError) setError(firstError)

    setTranslations(results)
    setLoading(false)
  }, [input])

  const cloudData = useMemo(() => {
    const text = input.trim()
    if (!text && translations.size === 0) return []

    const items: { text: string; value: number }[] = []
    // English original is the biggest (max value); translations get smaller random values
    if (text) {
      items.push({ text, value: 200 })
    }
    translations.forEach((translated, _lang) => {
      items.push({ text: translated, value: Math.floor(Math.random() * 80) + 1 })
    })
    return items
  }, [input, translations])

  const hasWords = cloudData.length > 0

  const fontSize = useCallback(
    (word: { value: number }) => {
      if (cloudData.length === 0) return 14
      const values = cloudData.map((w) => w.value)
      const minV = Math.min(...values)
      const maxV = Math.max(...values)
      const range = maxV - minV || 1
      const t = (word.value - minV) / range
      return Math.round(14 + t * (72 - 14))
    },
    [cloudData],
  )

  const random = useMemo(() => seedrandom('translator-42'), [])
  const rotate = useCallback(
    (_: { text: string; value: number }, i: number) => (i % 3 === 0 ? -90 : i % 3 === 1 ? 90 : 0),
    [],
  )

  const laidOutWords = useWordCloudLayout(cloudData, {
    fontSize,
    padding: 2,
    rotate,
    random,
  })

  return (
    <main className="page-wrap py-8 sm:py-12">
      <PageHero
        kicker="Translator"
        title="Multi-language word cloud"
        description="Enter a phrase and translate it into many languages, then see it as a word cloud."
      />

      <div className="rise-in mt-10 grid gap-8 lg:grid-cols-[1fr,1.2fr] lg:items-start">
        <section className="island-shell rounded-2xl p-5 sm:p-6 space-y-5">
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
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={runTranslate}
            disabled={loading || !input.trim()}
            className="w-full rounded-xl bg-lagoon px-4 py-3 text-sm font-semibold text-white hover:bg-lagoon/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Translating…' : 'Translate & show word cloud'}
          </button>

          {translations.size > 0 && !loading && (
            <p className="text-sm text-sea-ink-soft">
              {translations.size} translation{translations.size !== 1 ? 's' : ''} loaded.
            </p>
          )}
        </section>

        <WordCloudCanvas
          laidOutWords={laidOutWords}
          palette={[TRANSLATOR_TEXT_COLOR]}
          backgroundColor={TRANSLATOR_BG}
          mounted={mounted}
          hasWords={hasWords}
        />
      </div>
    </main>
  )
}
