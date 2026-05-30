export { getOrTranslatePhrase } from "#/lib/phraseTranslation/serverFn";
export { runGetOrTranslatePhrase } from "#/lib/phraseTranslation/pipeline";
export { getOrTranslatePhraseInputSchema } from "#/lib/phraseTranslation/input";
export type { GetOrTranslatePhraseInput } from "#/lib/phraseTranslation/input";
export type {
	GetOrTranslateResult,
	TranslationProvider,
} from "#/lib/phraseTranslation/types";
export {
	MAX_PHRASE_LENGTH,
	validatePhrase,
	parseStoredTranslations,
} from "#/lib/phraseTranslation/validation";
