import { createHash } from "node:crypto";

/** Non-reversible fingerprint for analytics (no raw phrase). */
export function phraseAnalyticsProps(phrase: string): {
	phrase_fingerprint: string;
	phrase_length: number;
} {
	const normalized = phrase.trim();
	const phrase_fingerprint = createHash("sha256")
		.update(normalized, "utf8")
		.digest("hex")
		.slice(0, 16);
	return { phrase_fingerprint, phrase_length: normalized.length };
}
