import type { CloudWord } from "#/lib/deduplicateByText";
import { deduplicateCloudWordsByText } from "#/lib/deduplicateByText";
import {
	clampWeight,
	DEFAULT_WEIGHT,
	type FullExperimentalTranslatorSearch,
} from "#/features/word-cloud/translatorSearchState";

/** Simple hash for word -> stable index into palette. */
export function hashWordForColor(word: string): number {
	let h = 0;
	for (let i = 0; i < word.length; i++) {
		h = (h << 5) - h + word.charCodeAt(i);
		h |= 0;
	}
	return Math.abs(h);
}

/** Set of hidden language codes for quick lookup. */
export function getHiddenLanguagesSet(
	formState: FullExperimentalTranslatorSearch,
): Set<string> {
	return new Set(formState.hiddenLanguages);
}

/** Translations filtered to those not hidden. */
export function getVisibleTranslations(
	translations: Map<string, string>,
	hiddenLanguages: Set<string>,
): [string, string][] {
	return Array.from(translations.entries()).filter(
		([lang]) => !hiddenLanguages.has(lang),
	);
}

/** Word cloud items: source phrase (if any) plus visible translations with clamped weights. */
export function getCloudData(
	formState: FullExperimentalTranslatorSearch,
	translations: Map<string, string>,
	weights: Map<string, number>,
	hiddenLanguages: Set<string>,
): CloudWord[] {
	if (!formState.input.trim() && translations.size === 0) {
		return [];
	}

	const items: CloudWord[] = [];
	const phrase = formState.input.trim();
	if (phrase) {
		items.push({ text: phrase, value: 12 });
	}
	translations.forEach((translatedText, lang) => {
		if (hiddenLanguages.has(lang)) return;
		const weight = weights.get(lang) ?? DEFAULT_WEIGHT;
		items.push({ text: translatedText, value: clampWeight(weight) });
	});
	return items;
}

export { deduplicateCloudWordsByText, deduplicateCloudWordsByText as deduplicateCloudDataByValue };

type TranslatorCloudOptions = {
	minFontSize: number;
	maxFontSize: number;
	padding: number;
	scale: FullExperimentalTranslatorSearch["scale"];
	spiral: FullExperimentalTranslatorSearch["spiral"];
	rotationAngles: [number, number];
	rotations: number;
	deterministic: boolean;
	fontFamily: string;
	randomSeed: string;
};

/** Cloud layout options derived from form state. */
export function getCloudOptions(
	formState: FullExperimentalTranslatorSearch,
): TranslatorCloudOptions {
	return {
		minFontSize: formState.minFontSize,
		maxFontSize: formState.maxFontSize,
		padding: formState.padding,
		scale: formState.scale,
		spiral: formState.spiral,
		rotationAngles: [formState.rotationMin, formState.rotationMax],
		rotations: formState.rotations,
		deterministic: formState.deterministic,
		fontFamily: formState.fontFamily,
		randomSeed: "translator",
	};
}
