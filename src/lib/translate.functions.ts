import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { phraseAnalyticsProps } from "#/lib/analyticsPhrase";
import { translatePhraseWithGoogle } from "#/lib/GoogleTranslation";
import { translatePhraseWithMicrosoft } from "#/lib/MicrosoftTranslation";
import type { GetOrTranslateResult } from "#/lib/translate.types";
import {
	getOrTranslatePhraseInputSchema,
} from "#/lib/translateServerInput";
import {
	parseStoredTranslations,
	validatePhrase,
} from "#/lib/translateValidation";
import {
	getExistingPhraseTranslation,
	storePhraseTranslations,
} from "#/lib/translationDb";
import { applyTranslatorRateLimit } from "#/lib/rateLimit";
import { getPostHogClient } from "#/utils/posthog-server";

const DEFAULT_SOURCE_LANGUAGE = "en";

type StepCtx = { googleMissed: boolean };

/** Keep one language per unique translation text so duplicate results collapse to one. */
function deduplicateTranslationsByValue(
	translations: Record<string, string>,
): Record<string, string> {
	const valueToKey = new Map<string, string>();
	for (const [lang, text] of Object.entries(translations)) {
		if (!text) continue;
		if (!valueToKey.has(text)) valueToKey.set(text, lang);
	}
	const out: Record<string, string> = {};
	for (const [text, lang] of valueToKey) out[lang] = text;
	return out;
}

type TranslationStepResult = {
	callNextStep: boolean;
	result?: GetOrTranslateResult;
	stepError?: string;
};

type TranslationStep = (
	phrase: string,
	sourceLanguage: string,
	ctx: StepCtx,
) => Promise<TranslationStepResult>;

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

async function validatePhraseStep(
	phrase: string,
	_sourceLanguage: string,
	_ctx: StepCtx,
): Promise<TranslationStepResult> {
	const validated = validatePhrase(phrase);
	if (!validated.ok) {
		return { callNextStep: false, result: validated };
	}

	return { callNextStep: true };
}

async function getCachedTranslationsStep(
	phrase: string,
	sourceLanguage: string,
	_ctx: StepCtx,
): Promise<TranslationStepResult> {
	const cached = await getCachedTranslations(phrase, sourceLanguage);
	if (!cached.ok) {
		return { callNextStep: false, result: cached };
	}

	if (cached.translations) {
		return {
			callNextStep: false,
			result: {
				ok: true,
				translations: deduplicateTranslationsByValue(cached.translations),
			},
		};
	}

	return { callNextStep: true };
}

async function getGoogleTranslationsStep(
	phrase: string,
	sourceLanguage: string,
	ctx: StepCtx,
): Promise<TranslationStepResult> {
	const googleResult = await translatePhraseWithGoogle(phrase, sourceLanguage);
	const deduped = deduplicateTranslationsByValue(googleResult.translations);
	if (Object.keys(deduped).length > 0) {
		return {
			callNextStep: false,
			result: await storePhraseTranslations(
				phrase,
				sourceLanguage,
				deduped,
			),
		};
	}

	ctx.googleMissed = true;
	return {
		callNextStep: true,
		stepError:
			googleResult.error ??
			"We couldn't generate translations for that phrase.",
	};
}

async function getMicrosoftTranslationsStep(
	phrase: string,
	sourceLanguage: string,
	ctx: StepCtx,
): Promise<TranslationStepResult> {
	try {
		const microsoftTranslations = await translatePhraseWithMicrosoft(
			phrase,
			sourceLanguage,
		);
		const deduped = deduplicateTranslationsByValue(microsoftTranslations);
		if (Object.keys(deduped).length > 0) {
			return {
				callNextStep: false,
				result: await storePhraseTranslations(
					phrase,
					sourceLanguage,
					deduped,
				),
			};
		}
	} catch (err) {
		const microsoftError = err instanceof Error ? err.message : String(err);
		return {
			callNextStep: false,
			result: {
				ok: false,
				error: microsoftError,
				failedProviders: ["microsoft"],
			},
		};
	}

	return {
		callNextStep: false,
		result: {
			ok: false,
			error: "We couldn't generate translations for that phrase.",
			failedProviders: ctx.googleMissed
				? (["google", "microsoft"] as const)
				: (["microsoft"] as const),
		},
	};
}

/** Internal: runs the translation pipeline. Exported for testing. */
export async function runGetOrTranslatePhrase(data: {
	phrase?: string;
	sourceLanguage?: string;
}): Promise<GetOrTranslateResult> {
	const phrase = data.phrase?.trim() ?? "";
	const sourceLanguage =
		data.sourceLanguage?.trim() || DEFAULT_SOURCE_LANGUAGE;

	const ctx: StepCtx = { googleMissed: false };
	const steps: TranslationStep[] = [
		validatePhraseStep,
		getCachedTranslationsStep,
		getGoogleTranslationsStep,
		getMicrosoftTranslationsStep,
	];

	let previousStepError: string | undefined;
	for (const step of steps) {
		const stepResult = await step(phrase, sourceLanguage, ctx);
		if (stepResult.stepError) {
			previousStepError = stepResult.stepError;
		}

		if (!stepResult.callNextStep) {
			if (!stepResult.result) {
				return {
					ok: false,
					error:
						previousStepError ??
						"We couldn't generate translations for that phrase.",
				};
			}

			return stepResult.result;
		}
	}

	return {
		ok: false,
		error:
			previousStepError ?? "We couldn't generate translations for that phrase.",
	};
}

function clientIpForRateLimit(): string | null {
	return getRequestIP({ xForwardedFor: true }) ?? null;
}

/**
 * Server function: get all translations for a phrase. If the phrase exists in
 * the database, return cached translations; otherwise translate to all target
 * languages, save one record, and return. Uses DB_URL and DB_AUTH_TOKEN for Turso.
 */
export const getOrTranslatePhrase = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => getOrTranslatePhraseInputSchema.parse(data))
	.handler(async (ctx) => {
		const rate = await applyTranslatorRateLimit(clientIpForRateLimit());
		if (rate.limited) {
			return { ok: false as const, error: rate.message };
		}

		const sourceLanguage =
			ctx.data.sourceLanguage?.trim() || DEFAULT_SOURCE_LANGUAGE;
		const result = await runGetOrTranslatePhrase({
			phrase: ctx.data.phrase,
			sourceLanguage,
		});
		const posthog = getPostHogClient();
		const analytics = phraseAnalyticsProps(ctx.data.phrase ?? "");
		if (result.ok) {
			posthog.capture({
				distinctId: "server",
				event: "phrase_translated",
				properties: {
					...analytics,
					source_language: sourceLanguage,
					translation_count: Object.keys(result.translations).length,
					source: "server_fn",
				},
			});
		} else {
			posthog.capture({
				distinctId: "server",
				event: "phrase_translation_failed",
				properties: {
					...analytics,
					source_language: sourceLanguage,
					error: result.error,
					failed_providers: result.failedProviders ?? [],
					source: "server_fn",
				},
			});
		}
		return result;
	});
