const GOOGLE_TRANSLATE_V2_URL = 'https://translation.googleapis.com/language/translate/v2'
const GOOGLE_MAX_CONCURRENCY = 8

const GOOGLE_TARGET_LANGUAGES = [
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
  'af', // Afrikaans
  'sq', // Albanian
  'am', // Amharic
  'hy', // Armenian
  'az', // Azerbaijani
  'eu', // Basque
  'be', // Belarusian
  'bn', // Bengali
  'bs', // Bosnian
  'my', // Burmese
  'ca', // Catalan
  'zh-Hans', // Chinese (Simplified)
  'zh-Hant', // Chinese (Traditional)
  'hr', // Croatian
  'en', // English
  'et', // Estonian
  'fil', // Filipino
  'fi', // Finnish
  'fy', // Frisian
  'gl', // Galician
  'ka', // Georgian
  'gn', // Guarani
  'gu', // Gujarati
  'ha', // Hausa
  'iw', // Hebrew (legacy)
  'hi', // Hindi
  'is', // Icelandic
  'ig', // Igbo
  'id', // Indonesian
  'ga', // Irish
  'it', // Italian
  'kn', // Kannada
  'km', // Khmer
  'ky', // Kyrgyz
  'lo', // Lao
  'lv', // Latvian
  'ln', // Lingala
  'lt', // Lithuanian
  'lb', // Luxembourgish
  'mk', // Macedonian
  'ms', // Malay
  'ml', // Malayalam
  'mt', // Maltese
  'mr', // Marathi
  'mn', // Mongolian
  'ne', // Nepali
  'nb', // Norwegian Bokmal
  'no', // Norwegian
  'or', // Odia
  'fa', // Persian
  'pa', // Punjabi
  'gd', // Scots Gaelic
  'sr', // Serbian
  'sk', // Slovak
  'sl', // Slovenian
  'so', // Somali
  'sw', // Swahili
  'tl', // Tagalog
  'tg', // Tajik
  'ta', // Tamil
  'te', // Telugu
  'th', // Thai
  'ur', // Urdu
  'uz', // Uzbek
  'cy', // Welsh
  'zu', // Zulu
] as const

async function mapWithConcurrency<TItem, TResult>(
  items: readonly TItem[],
  concurrency: number,
  worker: (item: TItem) => Promise<TResult>,
): Promise<PromiseSettledResult<TResult>[]> {
  const settledResults: PromiseSettledResult<TResult>[] = new Array(items.length)
  let nextIndex = 0

  async function runWorker() {
    while (true) {
      const currentIndex = nextIndex
      nextIndex += 1

      if (currentIndex >= items.length) {
        return
      }

      try {
        settledResults[currentIndex] = {
          status: 'fulfilled',
          value: await worker(items[currentIndex]),
        }
      } catch (reason) {
        settledResults[currentIndex] = {
          status: 'rejected',
          reason,
        }
      }
    }
  }

  const workerCount = Math.min(concurrency, items.length)
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      await runWorker()
    }),
  )

  return settledResults
}

async function translateOneWithGoogle(
  phrase: string,
  sourceLanguage: string,
  targetLanguage: string,
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_TRANSLSTE
  if (!apiKey?.trim()) return null

  const url = `${GOOGLE_TRANSLATE_V2_URL}?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      q: [phrase],
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text',
    }),
  })

  const json = (await res.json()) as {
    data?: { translations?: Array<{ translatedText: string }> }
    error?: { message?: string }
  }
  if (!res.ok || json.error) return null
  const text = json.data?.translations?.[0]?.translatedText?.trim()
  return text ?? null
}

export async function translatePhraseWithGoogle(
  phrase: string,
  sourceLanguage: string,
): Promise<{ translations: Record<string, string>; error: string | null }> {
  const apiKey = process.env.GOOGLE_TRANSLSTE
  if (!apiKey?.trim()) {
    return {
      translations: {},
      error: 'Google Translate API key is not configured (GOOGLE_TRANSLSTE).',
    }
  }

  const settled = await mapWithConcurrency(
    GOOGLE_TARGET_LANGUAGES,
    GOOGLE_MAX_CONCURRENCY,
    async (target) => {
      const text = await translateOneWithGoogle(phrase, sourceLanguage, target)
      return { target, text }
    },
  )

  const translations: Record<string, string> = {}
  let firstError: string | null = null
  for (const outcome of settled) {
    if (outcome.status === 'rejected') {
      if (!firstError) firstError = outcome.reason?.message ?? String(outcome.reason)
      continue
    }

    const { target, text } = outcome.value
    if (text) translations[target] = text
  }

  return { translations, error: firstError }
}
