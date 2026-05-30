import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { getOrTranslatePhraseInputSchema } from "#/lib/phraseTranslation/input";
import { runGetOrTranslatePhrase } from "#/lib/phraseTranslation/pipeline";
import { applyTranslatorRateLimit } from "#/lib/rateLimit";
import { capturePhraseTranslationAnalytics } from "#/lib/serverAnalytics";

const DEFAULT_SOURCE_LANGUAGE = "en";

function clientIpForRateLimit(): string | null {
	return getRequestIP({ xForwardedFor: true }) ?? null;
}

/**
 * Server function: get all translations for a phrase. Uses Turso cache when
 * configured, then Google and Microsoft providers.
 */
export const getOrTranslatePhrase = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => getOrTranslatePhraseInputSchema.parse(data))
	.handler(async (ctx) => {
		const rate = await applyTranslatorRateLimit(clientIpForRateLimit());
		if (rate.limited) {
			return { ok: false as const, error: rate.message };
		}

		const sourceLanguage =
			ctx.data.sourceLanguage?.trim() || DEFAULT_SOURCE_LANGUAGE;
		const result = await runGetOrTranslatePhrase({
			phrase: ctx.data.phrase,
			sourceLanguage,
		});
		capturePhraseTranslationAnalytics(
			ctx.data.phrase ?? "",
			sourceLanguage,
			result,
		);
		return result;
	});
