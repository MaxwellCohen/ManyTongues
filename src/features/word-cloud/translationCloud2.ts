import type { WordCloud2Options } from "#/features/word-cloud/components/WordCloud2Canvas";
import { hashWordForColor } from "#/features/word-cloud/translatorCloudData";
import {
	getTranslatorPalette,
	type FullExperimentalTranslatorSearch,
} from "#/features/word-cloud/translatorSearchState";

/**
 * wordcloud2.js only passes `weight` into weightFactor (not the word string). A fixed
 * 80px for the source phrase (weight 12) often cannot be placed for longer multi-word
 * phrases, so they disappear while shorter translations still draw.
 */
export function makeTranslationWeightFactor(
	phrase: string,
): (weight: number) => number {
	const charCount = Math.max(phrase.trim().length, 1);
	const maxByFit = Math.floor(520 / (charCount * 0.52));
	const sourcePx = Math.min(72, Math.max(32, maxByFit));
	return (weight: number) => {
		if (weight >= 12) return sourcePx;
		const translationPx = 12 + ((weight - 1) / 4) * 32;
		return Math.min(translationPx, Math.max(14, sourcePx - 4));
	};
}

/** wordcloud2.js expects rotation in radians. */
export function degToRad(deg: number): number {
	return (deg * Math.PI) / 180;
}

function resolveTranslationPageCloud2Color(
	formState: FullExperimentalTranslatorSearch,
): WordCloud2Options["color"] {
	if (formState.cloud2Color === "custom") {
		return (word: string) => {
			const palette = getTranslatorPalette(formState.colors);
			return palette[hashWordForColor(word) % palette.length];
		};
	}
	return formState.cloud2Color ?? "random-dark";
}

export function buildTranslationPageWordCloudOptions(
	formState: FullExperimentalTranslatorSearch,
	translationWeightFactor: (weight: number) => number,
): WordCloud2Options {
	return {
		fontFamily: formState.fontFamily ?? "system-ui, sans-serif",
		fontWeight: formState.cloud2FontWeight ?? "normal",
		weightFactor: translationWeightFactor,
		gridSize: formState.cloud2GridSize ?? 8,
		minRotation: degToRad(formState.cloud2MinRotation ?? -90),
		maxRotation: degToRad(formState.cloud2MaxRotation ?? 90),
		rotationSteps: formState.cloud2RotationSteps ?? 0,
		minSize: formState.cloud2MinSize ?? 0,
		shape: formState.cloud2Shape ?? "circle",
		ellipticity: Math.min(
			1,
			Math.max(0, Number(formState.cloud2Ellipticity) || 0.65),
		),
		color: resolveTranslationPageCloud2Color(formState),
		shuffle: formState.cloud2Shuffle ?? true,
		rotateRatio: formState.cloud2RotateRatio ?? 0.1,
	};
}
