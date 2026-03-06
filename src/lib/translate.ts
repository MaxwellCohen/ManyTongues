import { and, eq } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { phraseTranslationsTable } from '#/db/schema'
import { getTursoDb } from '#/lib/db'
import { TARGET_LANGUAGES } from '#/lib/translatorConstants'

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

export type GetOrTranslateResult =
  | { ok: true; translations: Record<string, string> }
  | { ok: false; error: string }

/**
 * Internal: call Google Translate API for one phrase and one target language.
 * Returns the translated string or null on failure.
 */
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

/**
 * Server function: get all translations for a phrase. If the phrase exists in
 * the database, return cached translations; otherwise translate to all target
 * languages, save one record, and return. Uses DB_URL and DB_AUTH_TOKEN for Turso.
 */
export const getOrTranslatePhrase = createServerFn({ method: 'POST' })
  .inputValidator((data: { phrase: string; sourceLanguage?: string }) => data)
  .handler(async ({ data }): Promise<GetOrTranslateResult> => {
    const phrase = data.phrase?.trim()
    if (!phrase) {
      return { ok: false, error: 'No phrase to translate.' }
    }

    if (phrase.length > 50) {
      return { ok: false, error: 'Phrase is too long (max 50 characters).' }
    }

    const sourceLanguage = data.sourceLanguage ?? 'en'

    const dbUrl = process.env.DB_URL
    if (!dbUrl?.trim()) {
      return { ok: false, error: 'Database is not configured (DB_URL).' }
    }

    const db = getTursoDb()
    const existing = await db
      .select()
      .from(phraseTranslationsTable)
      .where(
        and(
          eq(phraseTranslationsTable.phrase, phrase),
          eq(phraseTranslationsTable.sourceLanguage, sourceLanguage),
        ),
      )
      .limit(1)

    if (existing.length > 0) {
      try {
        const translations = JSON.parse(existing[0]!.translations) as Record<string, string>
        return { ok: true, translations: translations ?? {} }
      } catch {
        // Invalid JSON; fall through to re-translate and overwrite
      }
    }

    const apiKey = process.env.GOOGLE_TRANSLSTE
    if (!apiKey?.trim()) {
      return { ok: false, error: 'Google Translate API key is not configured (GOOGLE_TRANSLSTE).' }
    }

    const settled = await Promise.allSettled(
      TARGET_LANGUAGES.map(async (target) => {
        const text = await translateOneWithGoogle(phrase, sourceLanguage, target)
        return { target, text }
      }),
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

    if (Object.keys(translations).length === 0) {
      return { ok: false, error: firstError ?? 'No translations succeeded.' }
    }

    try {
      await db
        .insert(phraseTranslationsTable)
        .values({
          phrase,
          sourceLanguage,
          translations: JSON.stringify(translations),
        })
        .onConflictDoUpdate({
          target: [
            phraseTranslationsTable.phrase,
            phraseTranslationsTable.sourceLanguage,
          ],
          set: { translations: JSON.stringify(translations) },
        })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, error: `Failed to save translations: ${message}` }
    }

    return { ok: true, translations }
  })

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
