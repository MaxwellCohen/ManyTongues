import { z } from "zod";

/** Subset of ISO-style codes supported as translation *from* language in the UI and server. */
export const TRANSLATOR_SOURCE_LANGUAGE_OPTIONS = [
	{ code: "en", label: "English" },
	{ code: "es", label: "Spanish" },
	{ code: "fr", label: "French" },
	{ code: "de", label: "German" },
	{ code: "it", label: "Italian" },
	{ code: "pt", label: "Portuguese" },
	{ code: "nl", label: "Dutch" },
	{ code: "pl", label: "Polish" },
	{ code: "ru", label: "Russian" },
	{ code: "uk", label: "Ukrainian" },
	{ code: "ja", label: "Japanese" },
	{ code: "ko", label: "Korean" },
	{ code: "zh", label: "Chinese" },
	{ code: "ar", label: "Arabic" },
	{ code: "hi", label: "Hindi" },
	{ code: "sv", label: "Swedish" },
	{ code: "da", label: "Danish" },
	{ code: "no", label: "Norwegian" },
	{ code: "fi", label: "Finnish" },
	{ code: "cs", label: "Czech" },
	{ code: "el", label: "Greek" },
	{ code: "he", label: "Hebrew" },
] as const;

export type TranslatorSourceLanguageCode =
	(typeof TRANSLATOR_SOURCE_LANGUAGE_OPTIONS)[number]["code"];

export const TRANSLATOR_SOURCE_LANGUAGE_CODE_SET = new Set<string>(
	TRANSLATOR_SOURCE_LANGUAGE_OPTIONS.map((o) => o.code),
);

export const translatorSourceLanguageRouteSchema = z
	.string()
	.optional()
	.refine(
		(v) => v === undefined || TRANSLATOR_SOURCE_LANGUAGE_CODE_SET.has(v),
		{ message: "Invalid source language" },
	);
