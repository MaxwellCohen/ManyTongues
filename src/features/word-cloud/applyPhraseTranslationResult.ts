import type { GetOrTranslateResult } from "#/lib/phraseTranslation";
import {
	createRandomWeights,
	getTranslatorSearchForUrl,
	parseWeights,
	serializeWeights,
	WEIGHT_MAX,
	WEIGHT_MIN,
	type FullExperimentalTranslatorSearch,
	type ExperimentalTranslatorSearch,
} from "#/features/word-cloud/translatorSearchState";

function isTranslateSuccess(
	result: GetOrTranslateResult,
): result is Extract<GetOrTranslateResult, { ok: true }> {
	return result.ok;
}

export function formatTranslateFailure(
	result: Extract<GetOrTranslateResult, { ok: false }>,
): string {
	let msg = result.error;
	if (result.failedProviders?.length) {
		const labels = result.failedProviders.map((p) =>
			p === "google" ? "Google" : "Microsoft",
		);
		msg = `${msg} (${labels.join(" and ")} could not complete translation.)`;
	}
	return msg;
}

function mergeWeightsForTranslations(
	existingWeights: string,
	translationLangs: Iterable<string>,
): Map<string, number> {
	const existing = parseWeights(existingWeights);
	const merged = new Map(existing);
	for (const lang of translationLangs) {
		if (!merged.has(lang)) {
			merged.set(
				lang,
				Math.floor(Math.random() * WEIGHT_MAX) + WEIGHT_MIN,
			);
		}
	}
	return merged;
}

export type ApplyPhraseTranslationResult = {
	translations: Map<string, string>;
	error: string | null;
	urlPatch: Partial<ExperimentalTranslatorSearch>;
};

/** Maps a phrase translation server result into UI state and URL search updates. */
export function applyPhraseTranslationResult(
	result: GetOrTranslateResult,
	resolvedSearch: FullExperimentalTranslatorSearch,
	phrase: string,
	options?: { syncInputOnFailure?: boolean },
): ApplyPhraseTranslationResult {
	if (isTranslateSuccess(result)) {
		const nextWeights = resolvedSearch.weights
			? mergeWeightsForTranslations(
					resolvedSearch.weights,
					Object.keys(result.translations),
				)
			: createRandomWeights(Object.keys(result.translations));
		const nextHiddenLanguages = resolvedSearch.hiddenLanguages.filter(
			(lang) => result.translations[lang] !== undefined,
		);
		return {
			translations: new Map(Object.entries(result.translations)),
			error: null,
			urlPatch: getTranslatorSearchForUrl({
				...resolvedSearch,
				input: phrase,
				translated: true,
				weights: serializeWeights(nextWeights),
				hiddenLanguages: nextHiddenLanguages,
			}),
		};
	}

	return {
		translations: new Map(),
		error: formatTranslateFailure(result),
		urlPatch: getTranslatorSearchForUrl({
			...resolvedSearch,
			...(options?.syncInputOnFailure ? { input: phrase } : {}),
			translated: false,
		}),
	};
}
