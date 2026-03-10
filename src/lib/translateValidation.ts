export const MAX_PHRASE_LENGTH = 50

export function validatePhrase(
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

export function parseStoredTranslations(
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
