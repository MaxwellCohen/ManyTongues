import { phraseAnalyticsProps } from "#/lib/analyticsPhrase";
import { getPostHogClient, posthogApiKey } from "#/utils/posthog-server";
import type { GetOrTranslateResult } from "#/lib/phraseTranslation/types";

export function capturePhraseTranslationAnalytics(
	phrase: string,
	sourceLanguage: string,
	result: GetOrTranslateResult,
): void {
	if (!posthogApiKey()) return;

	const posthog = getPostHogClient();
	const analytics = phraseAnalyticsProps(phrase);

	if (result.ok) {
		posthog.capture({
			distinctId: "server",
			event: "phrase_translated",
			properties: {
				...analytics,
				source_language: sourceLanguage,
				translation_count: Object.keys(result.translations).length,
				source: "server_fn",
			},
		});
		return;
	}

	posthog.capture({
		distinctId: "server",
		event: "phrase_translation_failed",
		properties: {
			...analytics,
			source_language: sourceLanguage,
			error: result.error,
			failed_providers: result.failedProviders ?? [],
			source: "server_fn",
		},
	});
}
