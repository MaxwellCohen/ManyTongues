import {
	DEFAULT_COLORS,
	DEFAULT_FONT_FAMILY,
	type ScaleType,
	type SpiralType,
} from "#/lib/wordCloudUtils";
import { getSearchDiffFromDefaults, getValidPalette, mergeSearchWithDefaults } from "./search";

const TRANSLATOR_BG = "#c9a227";
const TRANSLATOR_TEXT_COLOR = "#000000";

export const translatorScaleOptions = ["linear", "sqrt", "log"] as const;
export const translatorSpiralOptions = ["archimedean", "rectangular"] as const;

export const translatorCloud2ShapeOptions = [
	"circle",
	"cardioid",
	"diamond",
	"square",
	"triangle-forward",
	"triangle",
	"pentagon",
	"star",
] as const;
export const translatorCloud2ColorOptions = [
	"random-dark",
	"random-light",
	"custom",
] as const;
export const translatorCloud2FontWeightOptions = ["normal", "bold"] as const;

export type TranslatorSearch = {
	input?: string;
	/** BCP47-style source language for the phrase (translation *from*). */
	sourceLanguage?: string;
	translated?: boolean;
	minFontSize?: number;
	maxFontSize?: number;
	padding?: number;
	scale?: (typeof translatorScaleOptions)[number];
	spiral?: (typeof translatorSpiralOptions)[number];
	rotationMin?: number;
	rotationMax?: number;
	rotations?: number;
	deterministic?: boolean;
	fontFamily?: string;
	backgroundColor?: string;
	colors?: string[];
	hiddenLanguages?: string[];
	weights?: string;
};

export type ExperimentalTranslatorSearch = TranslatorSearch & {
	/** wordcloud2.js options (experimental Translation page). */
	cloud2Shape?: (typeof translatorCloud2ShapeOptions)[number];
	cloud2Ellipticity?: number;
	cloud2Shuffle?: boolean;
	cloud2RotateRatio?: number;
	cloud2Color?: (typeof translatorCloud2ColorOptions)[number];
	cloud2GridSize?: number;
	cloud2MinRotation?: number;
	cloud2MaxRotation?: number;
	cloud2RotationSteps?: number;
	cloud2MinSize?: number;
	cloud2FontWeight?: (typeof translatorCloud2FontWeightOptions)[number];
};

export type FullTranslatorSearch = Required<TranslatorSearch>;
export type FullExperimentalTranslatorSearch =
	Required<ExperimentalTranslatorSearch>;

export const DEFAULT_TRANSLATOR_SEARCH: FullExperimentalTranslatorSearch = {
	input: "everything will be great",
	sourceLanguage: "en",
	translated: false,
	minFontSize: 14,
	maxFontSize: 72,
	padding: 1,
	scale: "sqrt" as ScaleType,
	spiral: "archimedean" as SpiralType,
	rotationMin: -90,
	rotationMax: 90,
	rotations: 3,
	deterministic: true,
	fontFamily: DEFAULT_FONT_FAMILY,
	backgroundColor: TRANSLATOR_BG,
	colors: [TRANSLATOR_TEXT_COLOR],
	hiddenLanguages: [],
	weights: "",
	cloud2Shape: "circle",
	cloud2Ellipticity: 0.65,
	cloud2Shuffle: true,
	cloud2RotateRatio: 0.1,
	cloud2Color: "random-dark",
	cloud2GridSize: 8,
	cloud2MinRotation: -90,
	cloud2MaxRotation: 90,
	cloud2RotationSteps: 0,
	cloud2MinSize: 0,
	cloud2FontWeight: "normal",
};

export const DEFAULT_WEIGHT = 3;
export const WEIGHT_MIN = 1;
export const WEIGHT_MAX = 5;

const translatorArrayKeys = ["colors", "hiddenLanguages"] as const satisfies readonly (keyof FullExperimentalTranslatorSearch)[];

export function clampWeight(value: number): number {
	return Math.min(
		WEIGHT_MAX,
		Math.max(WEIGHT_MIN, Math.round(Number(value) || DEFAULT_WEIGHT)),
	);
}

export function parseWeights(value: string): Map<string, number> {
	const weights = new Map<string, number>();

	for (const part of value.split(",")) {
		const [lang, rawWeight] = part.split(":");
		if (!lang || !rawWeight) continue;

		const parsed = Number(rawWeight);
		if (!Number.isFinite(parsed)) continue;

		weights.set(lang, clampWeight(parsed));
	}

	return weights;
}

export function serializeWeights(weights: Map<string, number>): string {
	return Array.from(weights.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([lang, weight]) => `${lang}:${clampWeight(weight)}`)
		.join(",");
}

export function createRandomWeights(
	languages: Iterable<string>,
): Map<string, number> {
	const weights = new Map<string, number>();

	for (const lang of languages) {
		weights.set(lang, Math.floor(Math.random() * WEIGHT_MAX) + WEIGHT_MIN);
	}

	return weights;
}

export function resolveTranslatorSearch(
	search: TranslatorSearch | ExperimentalTranslatorSearch,
): FullExperimentalTranslatorSearch {
	return mergeSearchWithDefaults(
		DEFAULT_TRANSLATOR_SEARCH,
		search,
		translatorArrayKeys,
	);
}

export function getTranslatorSearchForUrl(
	state: FullExperimentalTranslatorSearch,
): Partial<ExperimentalTranslatorSearch> {
	return getSearchDiffFromDefaults(state, DEFAULT_TRANSLATOR_SEARCH);
}

export function getTranslatorPalette(colors: string[]): string[] {
	return getValidPalette(colors, DEFAULT_COLORS);
}
