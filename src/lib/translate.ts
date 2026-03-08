import { createServerFn } from '@tanstack/react-start'
import {
  setResponseHeader,
  setResponseStatus,
} from '@tanstack/react-start/server'
import { translatePhraseWithGoogle } from '#/lib/GoogleTraslation'
import { translatePhraseWithMicrosoft } from '#/lib/MicrosoftTranslation'
import { consumeTranslatorRateLimit } from '#/lib/rateLimit'
import {
  getExistingPhraseTranslation,
  storePhraseTranslations,
} from '#/lib/translationDb'

const DEFAULT_SOURCE_LANGUAGE = 'en'
const MAX_PHRASE_LENGTH = 50

export type GetOrTranslateResult =
  | { ok: true; translations: Record<string, string> }
  | { ok: false; error: string }

type TranslationStepResult = {
  callNextStep: boolean
  result?: GetOrTranslateResult
  stepError?: string
}

type TranslationStep = (
  phrase: string,
  sourceLanguage: string,
) => Promise<TranslationStepResult>

function validatePhrase(
  phrase: string | undefined,
): { ok: true; phrase: string } | { ok: false; error: string } {
  const trimmedPhrase = phrase?.trim()
  if (!trimmedPhrase) {
    return { ok: false, error: 'Enter a phrase to translate.' }
  }

  if (trimmedPhrase.length > MAX_PHRASE_LENGTH) {
    return {
      ok: false,
      error: `Keep the phrase under ${MAX_PHRASE_LENGTH} characters.`,
    }
  }

  return { ok: true, phrase: trimmedPhrase }
}

function parseStoredTranslations(
  existingTranslationsJson: string | null,
): Record<string, string> | null {
  if (!existingTranslationsJson) {
    return null
  }

  try {
    return JSON.parse(existingTranslationsJson) as Record<string, string>
  } catch {
    return null
  }
}

async function getCachedTranslations(
  phrase: string,
  sourceLanguage: string,
): Promise<
  | { ok: true; translations: Record<string, string> | null }
  | { ok: false; error: string }
> {
  const lookup = await getExistingPhraseTranslation(phrase, sourceLanguage)
  if ('error' in lookup) {
    return { ok: false, error: lookup.error }
  }

  return {
    ok: true,
    translations: parseStoredTranslations(lookup.existingTranslationsJson),
  }
}

async function validatePhraseStep(
  phrase: string,
  _sourceLanguage: string,
): Promise<TranslationStepResult> {
  const validated = validatePhrase(phrase)
  if (!validated.ok) {
    return { callNextStep: false, result: validated }
  }

  return { callNextStep: true }
}

async function getCachedTranslationsStep(
  phrase: string,
  sourceLanguage: string,
): Promise<TranslationStepResult> {
  const cached = await getCachedTranslations(phrase, sourceLanguage)
  if (!cached.ok) {
    return { callNextStep: false, result: cached }
  }

  if (cached.translations) {
    return {
      callNextStep: false,
      result: { ok: true, translations: cached.translations },
    }
  }

  return { callNextStep: true }
}

async function getGoogleTranslationsStep(
  phrase: string,
  sourceLanguage: string,
): Promise<TranslationStepResult> {
  const googleResult = await translatePhraseWithGoogle(phrase, sourceLanguage)
  if (Object.keys(googleResult.translations).length > 0) {
    return {
      callNextStep: false,
      result: await storePhraseTranslations(phrase, sourceLanguage, googleResult.translations),
    }
  }

  return {
    callNextStep: true,
    stepError:
      googleResult.error ?? "We couldn't generate translations for that phrase.",
  }
}

async function enforceRateLimitStep(
  _phrase: string,
  _sourceLanguage: string,
): Promise<TranslationStepResult> {
  try {
    const rateLimit = await consumeTranslatorRateLimit()
    if (rateLimit.allowed) {
      return { callNextStep: true }
    }

    setResponseStatus(429)
    setResponseHeader('Retry-After', String(rateLimit.retryAfterSeconds))
    return {
      callNextStep: false,
      result: {
        ok: false,
        error: 'Too many translation requests. Try again in a few minutes.',
      },
    }
  } catch {
    setResponseStatus(503)
    return {
      callNextStep: false,
      result: {
        ok: false,
        error: 'Translation service is temporarily unavailable.',
      },
    }
  }
}

async function getMicrosoftTranslationsStep(
  phrase: string,
  sourceLanguage: string,
): Promise<TranslationStepResult> {
  try {
    const microsoftTranslations = await translatePhraseWithMicrosoft(phrase, sourceLanguage)
    if (Object.keys(microsoftTranslations).length > 0) {
      return {
        callNextStep: false,
        result: await storePhraseTranslations(phrase, sourceLanguage, microsoftTranslations),
      }
    }
  } catch (err) {
    const microsoftError = err instanceof Error ? err.message : String(err)
    return {
      callNextStep: false,
      result: { ok: false, error: microsoftError },
    }
  }

  return {
    callNextStep: false,
    result: {
      ok: false,
      error: "We couldn't generate translations for that phrase.",
    },
  }
}

/**
 * Server function: get all translations for a phrase. If the phrase exists in
 * the database, return cached translations; otherwise translate to all target
 * languages, save one record, and return. Uses DB_URL and DB_AUTH_TOKEN for Turso.
 */
export const getOrTranslatePhrase = createServerFn({ method: 'POST' })
  .inputValidator((data: { phrase: string; sourceLanguage?: string }) => data)
  .handler(async ({ data }): Promise<GetOrTranslateResult> => {
    const phrase = data.phrase?.trim() ?? ''
    const sourceLanguage = DEFAULT_SOURCE_LANGUAGE
    const steps: TranslationStep[] = [
      validatePhraseStep,
      getCachedTranslationsStep,
      // enforceRateLimitStep,
      getGoogleTranslationsStep,
      getMicrosoftTranslationsStep,
    ]

    let previousStepError: string | undefined
    for (const step of steps) {
      const stepResult = await step(phrase, sourceLanguage)
      if (stepResult.stepError) {
        previousStepError = stepResult.stepError
      }

      if (!stepResult.callNextStep) {
        if (!stepResult.result) {
          return {
            ok: false,
            error:
              previousStepError ??
              "We couldn't generate translations for that phrase.",
          }
        }
        return stepResult.result
      }
    }

    return {
      ok: false,
      error:
        previousStepError ?? "We couldn't generate translations for that phrase.",
    }
  })
