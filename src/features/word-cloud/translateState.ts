/** Barrel: Translator search state + cloud presentation data. */

export {
	deduplicateCloudWordsByText,
	getCloudData,
	getCloudOptions,
	getHiddenLanguagesSet,
	getVisibleTranslations,
	hashWordForColor,
} from "#/features/word-cloud/translatorCloudData";
export {
	clampWeight,
	createRandomWeights,
	DEFAULT_TRANSLATOR_SEARCH,
	DEFAULT_WEIGHT,
	type ExperimentalTranslatorSearch,
	type FullExperimentalTranslatorSearch,
	getTranslatorPalette,
	getTranslatorSearchForUrl,
	parseWeights,
	resolveTranslatorSearch,
	serializeWeights,
	translatorCloud2ColorOptions,
	translatorCloud2FontWeightOptions,
	translatorCloud2ShapeOptions,
	WEIGHT_MAX,
	WEIGHT_MIN,
} from "#/features/word-cloud/translatorSearchState";
