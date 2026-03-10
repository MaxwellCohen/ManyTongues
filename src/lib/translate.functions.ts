import { createServerFn } from '@tanstack/react-start'
import { translatePhraseWithGoogle } from '#/lib/GoogleTraslation'
import { translatePhraseWithMicrosoft } from '#/lib/MicrosoftTranslation'
import type { GetOrTranslateResult } from '#/lib/translate.types'
import {
  getExistingPhraseTranslation,
  storePhraseTranslations,
} from '#/lib/translationDb'
import {
  parseStoredTranslations,
  validatePhrase,
} from '#/lib/translateValidation'

const DEFAULT_SOURCE_LANGUAGE = 'en'

type TranslationStepResult = {
  callNextStep: boolean
  result?: GetOrTranslateResult
  stepError?: string
}

type TranslationStep = (
  phrase: string,
  sourceLanguage: string,
) => Promise<TranslationStepResult>

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
      result: await storePhraseTranslations(
        phrase,
        sourceLanguage,
        googleResult.translations,
      ),
    }
  }

  return {
    callNextStep: true,
    stepError:
      googleResult.error ?? "We couldn't generate translations for that phrase.",
  }
}

async function getMicrosoftTranslationsStep(
  phrase: string,
  sourceLanguage: string,
): Promise<TranslationStepResult> {
  try {
    const microsoftTranslations = await translatePhraseWithMicrosoft(
      phrase,
      sourceLanguage,
    )
    if (Object.keys(microsoftTranslations).length > 0) {
      return {
        callNextStep: false,
        result: await storePhraseTranslations(
          phrase,
          sourceLanguage,
          microsoftTranslations,
        ),
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

/** Internal: runs the translation pipeline. Exported for testing. */
export async function runGetOrTranslatePhrase(data: {
  phrase?: string
  sourceLanguage?: string
}): Promise<GetOrTranslateResult> {
  const phrase = data.phrase?.trim() ?? ''
  const sourceLanguage = data.sourceLanguage ?? DEFAULT_SOURCE_LANGUAGE

  const steps: TranslationStep[] = [
    validatePhraseStep,
    getCachedTranslationsStep,
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
}

/**
 * Server function: get all translations for a phrase. If the phrase exists in
 * the database, return cached translations; otherwise translate to all target
 * languages, save one record, and return. Uses DB_URL and DB_AUTH_TOKEN for Turso.
 */
export const getOrTranslatePhrase = createServerFn({ method: 'POST' })
  .inputValidator((data: { phrase: string; sourceLanguage?: string }) => data)
  .handler((ctx) => runGetOrTranslatePhrase(ctx.data))
