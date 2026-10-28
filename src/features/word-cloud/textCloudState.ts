import {
	DEFAULT_BG,
	DEFAULT_COLORS,
	DEFAULT_FONT_FAMILY,
	DEFAULT_TEXT,
	type SpiralType,
} from "#/lib/wordCloudUtils";
import {
	getSearchDiffFromDefaults,
	getValidPalette,
	mergeSearchWithDefaults,
} from "./search";
import {
	translatorCloud2ColorOptions,
	translatorCloud2FontWeightOptions,
	translatorCloud2ShapeOptions,
} from "./translatorSearchState";
import {
	DEFAULT_WORD_CLOUD_ENGINE,
	type WordCloudEngine,
	wordCloudEngineOptions,
} from "./wordCloudEngine";

export const generatorScaleOptions = ["linear", "sqrt", "log"] as const;
export const generatorSpiralOptions = ["archimedean", "rectangular"] as const;

export {
	translatorCloud2ColorOptions,
	translatorCloud2FontWeightOptions,
	translatorCloud2ShapeOptions,
	wordCloudEngineOptions,
};

export type GeneratorSearch = {
	input?: string;
	engine?: WordCloudEngine;
	/** When true, exclude DEFAULT_STOPWORDS from the word cloud. */
	filterStopwords?: boolean;
	/** Additional words to exclude (e.g. custom stopwords). */
	customExclude?: string[];
	minFontSize?: number;
	maxFontSize?: number;
	padding?: number;
	scale?: (typeof generatorScaleOptions)[number];
	spiral?: (typeof generatorSpiralOptions)[number];
	rotationMin?: number;
	rotationMax?: number;
	rotations?: number;
	deterministic?: boolean;
	fontFamily?: string;
	colors?: string[];
	backgroundColor?: string;
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

export type FullGeneratorSearch = Required<GeneratorSearch>;

export const DEFAULT_GENERATOR_SEARCH: FullGeneratorSearch = {
	input: DEFAULT_TEXT,
	engine: DEFAULT_WORD_CLOUD_ENGINE,
	filterStopwords: false,
	customExclude: [],
	minFontSize: 14,
	maxFontSize: 72,
	padding: 1,
	scale: "sqrt",
	spiral: "archimedean" as SpiralType,
	rotationMin: -90,
	rotationMax: 0,
	rotations: 2,
	deterministic: true,
	fontFamily: DEFAULT_FONT_FAMILY,
	colors: [...DEFAULT_COLORS],
	backgroundColor: DEFAULT_BG,
	cloud2Shape: "circle",
	cloud2Ellipticity: 0.65,
	cloud2Shuffle: true,
	cloud2RotateRatio: 0.1,
	cloud2Color: "custom",
	cloud2GridSize: 8,
	cloud2MinRotation: -90,
	cloud2MaxRotation: 90,
	cloud2RotationSteps: 0,
	cloud2MinSize: 0,
	cloud2FontWeight: "normal",
};

const generatorArrayKeys = [
	"colors",
	"customExclude",
] as const satisfies readonly (keyof FullGeneratorSearch)[];

export function resolveGeneratorSearch(
	search: GeneratorSearch,
): FullGeneratorSearch {
	return mergeSearchWithDefaults(
		DEFAULT_GENERATOR_SEARCH,
		search,
		generatorArrayKeys,
	);
}

export function getGeneratorSearchForUrl(
	state: FullGeneratorSearch,
): Partial<GeneratorSearch> {
	return getSearchDiffFromDefaults(state, DEFAULT_GENERATOR_SEARCH);
}

export function getGeneratorPalette(colors: string[]): string[] {
	return getValidPalette(colors, DEFAULT_COLORS);
}
