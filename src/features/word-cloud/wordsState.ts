import { DEFAULT_BG } from "#/lib/wordCloudUtils";
import { getSearchDiffFromDefaults, mergeSearchWithDefaults } from "./search";
import {
	DEFAULT_TRANSLATOR_SEARCH,
	getTranslatorPalette,
	hashWordForColor,
	translatorCloud2ColorOptions,
	translatorCloud2FontWeightOptions,
	translatorCloud2ShapeOptions,
} from "./translateState";

export {
	DEFAULT_TRANSLATOR_SEARCH,
	getTranslatorPalette,
	hashWordForColor,
	translatorCloud2ColorOptions,
	translatorCloud2FontWeightOptions,
	translatorCloud2ShapeOptions,
};

export type WordsSearch = {
	input?: string;
	/** When true, exclude DEFAULT_STOPWORDS from the word cloud. */
	filterStopwords?: boolean;
	/** Additional words to exclude (e.g. custom stopwords). */
	customExclude?: string[];
	backgroundColor?: string;
	colors?: string[];
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

export type FullWordsSearch = Required<WordsSearch>;

const wordsArrayKeys = ["colors", "customExclude"] as const satisfies readonly (keyof FullWordsSearch)[];

export const DEFAULT_WORDS_SEARCH: FullWordsSearch = {
	input: "",
	filterStopwords: false,
	customExclude: [],
	backgroundColor: DEFAULT_BG,
	colors: DEFAULT_TRANSLATOR_SEARCH.colors,
	cloud2Shape: DEFAULT_TRANSLATOR_SEARCH.cloud2Shape,
	cloud2Ellipticity: DEFAULT_TRANSLATOR_SEARCH.cloud2Ellipticity,
	cloud2Shuffle: DEFAULT_TRANSLATOR_SEARCH.cloud2Shuffle,
	cloud2RotateRatio: DEFAULT_TRANSLATOR_SEARCH.cloud2RotateRatio,
	cloud2Color: DEFAULT_TRANSLATOR_SEARCH.cloud2Color,
	cloud2GridSize: DEFAULT_TRANSLATOR_SEARCH.cloud2GridSize,
	cloud2MinRotation: DEFAULT_TRANSLATOR_SEARCH.cloud2MinRotation,
	cloud2MaxRotation: DEFAULT_TRANSLATOR_SEARCH.cloud2MaxRotation,
	cloud2RotationSteps: DEFAULT_TRANSLATOR_SEARCH.cloud2RotationSteps,
	cloud2MinSize: DEFAULT_TRANSLATOR_SEARCH.cloud2MinSize,
	cloud2FontWeight: DEFAULT_TRANSLATOR_SEARCH.cloud2FontWeight,
};

export function resolveWordsSearch(search: WordsSearch): FullWordsSearch {
	return mergeSearchWithDefaults(
		DEFAULT_WORDS_SEARCH,
		search,
		wordsArrayKeys,
	);
}

export function getWordsSearchForUrl(
	state: FullWordsSearch,
): Partial<WordsSearch> {
	return getSearchDiffFromDefaults(state, DEFAULT_WORDS_SEARCH);
}
