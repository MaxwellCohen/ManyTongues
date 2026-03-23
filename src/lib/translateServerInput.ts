import { z } from "zod";
import { MAX_PHRASE_LENGTH } from "#/lib/translateValidation";
import { TRANSLATOR_SOURCE_LANGUAGE_CODE_SET } from "#/lib/translatorSourceLanguages";

/** Max body size guard before `validatePhrase` runs in the pipeline. */
const PHRASE_BODY_MAX = MAX_PHRASE_LENGTH + 500;

export const getOrTranslatePhraseInputSchema = z.object({
	phrase: z.string().max(PHRASE_BODY_MAX),
	sourceLanguage: z
		.string()
		.optional()
		.refine(
			(v) => v === undefined || TRANSLATOR_SOURCE_LANGUAGE_CODE_SET.has(v),
			{ message: "Invalid source language" },
		),
});

export type GetOrTranslatePhraseInput = z.infer<
	typeof getOrTranslatePhraseInputSchema
>;
