import { z } from "zod";

export const wordCloudEngineOptions = ["experimental", "classic"] as const;

export type WordCloudEngine = (typeof wordCloudEngineOptions)[number];

/** Default engine: wordcloud2.js (experimental). */
export const DEFAULT_WORD_CLOUD_ENGINE: WordCloudEngine = "experimental";

export const wordCloudEngineSearchParam = z.enum(wordCloudEngineOptions);

export function resolveWordCloudEngine(
	engine: WordCloudEngine | undefined,
): WordCloudEngine {
	return engine ?? DEFAULT_WORD_CLOUD_ENGINE;
}

export function isExperimentalEngine(engine: WordCloudEngine): boolean {
	return engine === "experimental";
}
