import { deduplicateTranslationsByValue } from "#/lib/deduplicateByText";
import { translatePhraseWithGoogle } from "#/lib/GoogleTranslation";
import { translatePhraseWithMicrosoft } from "#/lib/MicrosoftTranslation";
import type { TranslationProvider } from "#/lib/phraseTranslation/types";

export type ProviderTranslateResult =
	| { ok: true; translations: Record<string, string> }
	| { ok: false; error: string };

const GENERIC_FAILURE = "We couldn't generate translations for that phrase.";

export async function translateWithGoogleProvider(
	phrase: string,
	sourceLanguage: string,
): Promise<ProviderTranslateResult> {
	const googleResult = await translatePhraseWithGoogle(phrase, sourceLanguage);
	const translations = deduplicateTranslationsByValue(googleResult.translations);
	if (Object.keys(translations).length > 0) {
		return { ok: true, translations };
	}
	return {
		ok: false,
		error: googleResult.error ?? GENERIC_FAILURE,
	};
}

export async function translateWithMicrosoftProvider(
	phrase: string,
	sourceLanguage: string,
): Promise<ProviderTranslateResult> {
	try {
		const raw = await translatePhraseWithMicrosoft(phrase, sourceLanguage);
		const translations = deduplicateTranslationsByValue(raw);
		if (Object.keys(translations).length > 0) {
			return { ok: true, translations };
		}
		return { ok: false, error: GENERIC_FAILURE };
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return { ok: false, error: message };
	}
}

export type ProviderFailure = {
	provider: TranslationProvider;
	error: string;
};
