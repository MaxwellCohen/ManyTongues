/** Barrel: Translator search state + cloud presentation data. */
export {
	translatorScaleOptions,
	translatorSpiralOptions,
	translatorCloud2ShapeOptions,
	translatorCloud2ColorOptions,
	translatorCloud2FontWeightOptions,
	DEFAULT_TRANSLATOR_SEARCH,
	DEFAULT_WEIGHT,
	WEIGHT_MIN,
	WEIGHT_MAX,
	clampWeight,
	parseWeights,
	serializeWeights,
	createRandomWeights,
	resolveTranslatorSearch,
	getTranslatorSearchForUrl,
	getTranslatorPalette,
	type TranslatorSearch,
	type ExperimentalTranslatorSearch,
	type FullTranslatorSearch,
	type FullExperimentalTranslatorSearch,
} from "#/features/word-cloud/translatorSearchState";

export {
	hashWordForColor,
	getHiddenLanguagesSet,
	getVisibleTranslations,
	getCloudData,
	getCloudOptions,
	deduplicateCloudWordsByText,
	deduplicateCloudDataByValue,
} from "#/features/word-cloud/translatorCloudData";
