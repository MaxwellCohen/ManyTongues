import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#/lib/translationProviders", () => ({
	translateWithGoogleProvider: vi.fn(),
	translateWithMicrosoftProvider: vi.fn(),
}));
vi.mock("#/lib/translationDb", () => ({
	getExistingPhraseTranslation: vi.fn(),
	storePhraseTranslations: vi.fn(),
}));

import {
	translateWithGoogleProvider,
	translateWithMicrosoftProvider,
} from "#/lib/translationProviders";
import {
	getExistingPhraseTranslation,
	storePhraseTranslations,
} from "#/lib/translationDb";
import { runGetOrTranslatePhrase } from "#/lib/phraseTranslation/pipeline";

describe("runGetOrTranslatePhrase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns validation error for empty phrase", async () => {
		const result = await runGetOrTranslatePhrase({ phrase: "" });
		expect(result).toEqual({ ok: false, error: "Enter a phrase to translate." });
	});

	it("returns validation error for whitespace-only phrase", async () => {
		const result = await runGetOrTranslatePhrase({ phrase: "   \n\t  " });
		expect(result).toEqual({ ok: false, error: "Enter a phrase to translate." });
	});

	it("returns validation error for phrase over 50 characters", async () => {
		const longPhrase = "a".repeat(51);
		const result = await runGetOrTranslatePhrase({ phrase: longPhrase });
		expect(result).toEqual({
			ok: false,
			error: "Keep the phrase under 50 characters.",
		});
	});

	it("returns cached translations when phrase exists in DB", async () => {
		vi.mocked(getExistingPhraseTranslation).mockResolvedValue({
			existingTranslationsJson: JSON.stringify({ fr: "bonjour", es: "hola" }),
		});

		const result = await runGetOrTranslatePhrase({ phrase: "hello" });

		expect(result).toEqual({
			ok: true,
			translations: { fr: "bonjour", es: "hola" },
		});
		expect(translateWithGoogleProvider).not.toHaveBeenCalled();
	});

	it("returns DB error when translationDb lookup fails", async () => {
		vi.mocked(getExistingPhraseTranslation).mockResolvedValue({
			error: "Database is not configured (DB_URL).",
		});

		const result = await runGetOrTranslatePhrase({ phrase: "hello" });

		expect(result).toEqual({
			ok: false,
			error: "Database is not configured (DB_URL).",
		});
	});

	it("uses Google when cache miss, then stores and returns", async () => {
		vi.mocked(getExistingPhraseTranslation).mockResolvedValue({
			existingTranslationsJson: null,
		});
		vi.mocked(translateWithGoogleProvider).mockResolvedValue({
			ok: true,
			translations: { fr: "bonjour" },
		});
		vi.mocked(storePhraseTranslations).mockResolvedValue({
			ok: true,
			translations: { fr: "bonjour" },
		});

		const result = await runGetOrTranslatePhrase({ phrase: "hello" });

		expect(result).toEqual({ ok: true, translations: { fr: "bonjour" } });
		expect(storePhraseTranslations).toHaveBeenCalledWith(
			"hello",
			"en",
			{ fr: "bonjour" },
		);
	});

	it("falls back to Microsoft when Google returns empty", async () => {
		vi.mocked(getExistingPhraseTranslation).mockResolvedValue({
			existingTranslationsJson: null,
		});
		vi.mocked(translateWithGoogleProvider).mockResolvedValue({
			ok: false,
			error: "Google failed",
		});
		vi.mocked(translateWithMicrosoftProvider).mockResolvedValue({
			ok: true,
			translations: { fr: "bonjour", es: "hola" },
		});
		vi.mocked(storePhraseTranslations).mockResolvedValue({
			ok: true,
			translations: { fr: "bonjour", es: "hola" },
		});

		const result = await runGetOrTranslatePhrase({ phrase: "hello" });

		expect(result).toEqual({
			ok: true,
			translations: { fr: "bonjour", es: "hola" },
		});
	});

	it("returns error when both Google and Microsoft fail", async () => {
		vi.mocked(getExistingPhraseTranslation).mockResolvedValue({
			existingTranslationsJson: null,
		});
		vi.mocked(translateWithGoogleProvider).mockResolvedValue({
			ok: false,
			error: "Google failed",
		});
		vi.mocked(translateWithMicrosoftProvider).mockResolvedValue({
			ok: false,
			error: "We couldn't generate translations for that phrase.",
		});

		const result = await runGetOrTranslatePhrase({ phrase: "hello" });

		expect(result).toEqual({
			ok: false,
			error: "We couldn't generate translations for that phrase.",
			failedProviders: ["google", "microsoft"],
		});
	});

	it("returns Microsoft error when Microsoft returns a specific failure", async () => {
		vi.mocked(getExistingPhraseTranslation).mockResolvedValue({
			existingTranslationsJson: null,
		});
		vi.mocked(translateWithGoogleProvider).mockResolvedValue({
			ok: false,
			error: "Google failed",
		});
		vi.mocked(translateWithMicrosoftProvider).mockResolvedValue({
			ok: false,
			error: "Microsoft API error",
		});

		const result = await runGetOrTranslatePhrase({ phrase: "hello" });

		expect(result).toEqual({
			ok: false,
			error: "Microsoft API error",
			failedProviders: ["microsoft"],
		});
	});

	it("falls through to Google when cached JSON is invalid", async () => {
		vi.mocked(getExistingPhraseTranslation).mockResolvedValue({
			existingTranslationsJson: "invalid json {{{",
		});
		vi.mocked(translateWithGoogleProvider).mockResolvedValue({
			ok: true,
			translations: { fr: "bonjour" },
		});
		vi.mocked(storePhraseTranslations).mockResolvedValue({
			ok: true,
			translations: { fr: "bonjour" },
		});

		const result = await runGetOrTranslatePhrase({ phrase: "hello" });

		expect(result).toEqual({ ok: true, translations: { fr: "bonjour" } });
		expect(translateWithGoogleProvider).toHaveBeenCalled();
	});

	it("trims phrase in data", async () => {
		vi.mocked(getExistingPhraseTranslation).mockResolvedValue({
			existingTranslationsJson: JSON.stringify({ fr: "bonjour" }),
		});

		const result = await runGetOrTranslatePhrase({ phrase: "  hello  " });

		expect(getExistingPhraseTranslation).toHaveBeenCalledWith("hello", "en");
		expect(result).toEqual({ ok: true, translations: { fr: "bonjour" } });
	});
});
