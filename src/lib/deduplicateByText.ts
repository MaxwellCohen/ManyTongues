/** Keep one language per unique translation text (first language wins). */
export function deduplicateTranslationsByValue(
	translations: Record<string, string>,
): Record<string, string> {
	const valueToKey = new Map<string, string>();
	for (const [lang, text] of Object.entries(translations)) {
		if (!text) continue;
		if (!valueToKey.has(text)) valueToKey.set(text, lang);
	}
	const out: Record<string, string> = {};
	for (const [text, lang] of valueToKey) out[lang] = text;
	return out;
}

export type CloudWord = { text: string; value: number };

/**
 * Deduplicate cloud items by displayed text: keep the maximum weight per string.
 * The source phrase (typically value 12) wins when it matches a translation.
 */
export function deduplicateCloudWordsByText(items: CloudWord[]): CloudWord[] {
	const byText = new Map<string, number>();
	for (const item of items) {
		const existing = byText.get(item.text);
		byText.set(item.text, Math.max(existing ?? 0, item.value));
	}
	return Array.from(byText.entries(), ([text, value]) => ({ text, value }));
}

/** @deprecated Use {@link deduplicateCloudWordsByText}. */
export const deduplicateCloudDataByValue = deduplicateCloudWordsByText;
