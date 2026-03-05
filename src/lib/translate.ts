import { createServerFn } from '@tanstack/react-start'

const GOOGLE_TRANSLATE_V2_URL = 'https://translation.googleapis.com/language/translate/v2'

export type TranslateInput = {
  /** Text to translate (single string or array for batch). */
  text: string | string[]
  /** Target language code (e.g. "es", "fr"). */
  targetLanguage: string
  /** Source language code (default "en"). */
  sourceLanguage?: string
}

export type TranslateResult =
  | { ok: true; translatedText: string; translatedTexts?: string[] }
  | { ok: false; error: string }

/**
 * Server function: translate text from English (or given source) to a target
 * language using Google Cloud Translation Basic API (v2).
 * API key is read from process.env.GOOGLE_TRANSLSTE.
 */
export const translateWithGoogle = createServerFn({ method: 'POST' })
  .inputValidator((data: TranslateInput) => data)
  .handler(async ({ data }): Promise<TranslateResult> => {
    const apiKey = process.env.GOOGLE_TRANSLSTE
    if (!apiKey?.trim()) {
      return { ok: false, error: 'Google Translate API key is not configured (GOOGLE_TRANSLSTE).' }
    }

    const source = data.sourceLanguage ?? 'en'
    const target = data.targetLanguage
    const q = Array.isArray(data.text) ? data.text : [data.text]
    if (q.length === 0 || q.every((t) => !t?.trim())) {
      return { ok: false, error: 'No text to translate.' }
    }

    const url = `${GOOGLE_TRANSLATE_V2_URL}?key=${encodeURIComponent(apiKey)}`
    const body = {
      q,
      source,
      target,
      format: 'text',
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    })

    const json = (await res.json()) as {
      data?: { translations?: Array<{ translatedText: string }> }
      error?: { code?: number; message?: string }
    }

    if (!res.ok || json.error) {
      const message = json.error?.message ?? res.statusText ?? 'Translation request failed.'
      return { ok: false, error: message }
    }

    const translations = json.data?.translations ?? []
    if (translations.length === 0) {
      return { ok: false, error: 'No translation returned.' }
    }

    const translatedTexts = translations.map((t) => t.translatedText ?? '')
    const single = translatedTexts.length === 1 ? translatedTexts[0]! : translatedTexts.join('\n')

    return {
      ok: true,
      translatedText: single,
      ...(translations.length > 1 ? { translatedTexts } : {}),
    }
  })
