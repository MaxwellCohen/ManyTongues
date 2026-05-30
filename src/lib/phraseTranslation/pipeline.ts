import { deduplicateTranslationsByValue } from "#/lib/deduplicateByText";
import {
	translateWithGoogleProvider,
	translateWithMicrosoftProvider,
} from "#/lib/translationProviders";
import type { GetOrTranslateResult } from "#/lib/phraseTranslation/types";
import {
	parseStoredTranslations,
	validatePhrase,
} from "#/lib/phraseTranslation/validation";
import {
	getExistingPhraseTranslation,
	storePhraseTranslations,
} from "#/lib/translationDb";

const DEFAULT_SOURCE_LANGUAGE = "en";
const GENERIC_FAILURE = "We couldn't generate translations for that phrase.";

async function getCachedTranslations(
	phrase: string,
	sourceLanguage: string,
): Promise<
	| { ok: true; translations: Record<string, string> | null }
	| { ok: false; error: string }
> {
	const lookup = await getExistingPhraseTranslation(phrase, sourceLanguage);
	if ("error" in lookup) {
		return { ok: false, error: lookup.error };
	}

	return {
		ok: true,
		translations: parseStoredTranslations(lookup.existingTranslationsJson),
	};
}

/** Runs phrase validation, cache lookup, provider fallback, and persistence. */
export async function runGetOrTranslatePhrase(data: {
	phrase?: string;
	sourceLanguage?: string;
}): Promise<GetOrTranslateResult> {
	const validated = validatePhrase(data.phrase);
	if (!validated.ok) {
		return validated;
	}

	const phrase = validated.phrase;
	const sourceLanguage =
		data.sourceLanguage?.trim() || DEFAULT_SOURCE_LANGUAGE;

	const cached = await getCachedTranslations(phrase, sourceLanguage);
	if (!cached.ok) {
		return cached;
	}

	if (cached.translations) {
		return {
			ok: true,
			translations: deduplicateTranslationsByValue(cached.translations),
		};
	}

	const google = await translateWithGoogleProvider(phrase, sourceLanguage);
	if (google.ok) {
		return storePhraseTranslations(phrase, sourceLanguage, google.translations);
	}

	const microsoft = await translateWithMicrosoftProvider(phrase, sourceLanguage);
	if (microsoft.ok) {
		return storePhraseTranslations(
			phrase,
			sourceLanguage,
			microsoft.translations,
		);
	}

	if (microsoft.error !== GENERIC_FAILURE) {
		return {
			ok: false,
			error: microsoft.error,
			failedProviders: ["microsoft"],
		};
	}

	return {
		ok: false,
		error: GENERIC_FAILURE,
		failedProviders: ["google", "microsoft"],
	};
}
