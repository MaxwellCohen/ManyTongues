import { describe, expect, it } from "vitest";
import { getOrTranslatePhraseInputSchema } from "./translateServerInput";

describe("getOrTranslatePhraseInputSchema", () => {
	it("accepts phrase and optional sourceLanguage", () => {
		expect(
			getOrTranslatePhraseInputSchema.parse({
				phrase: "hello",
				sourceLanguage: "es",
			}),
		).toEqual({ phrase: "hello", sourceLanguage: "es" });
	});

	it("rejects unknown source language", () => {
		expect(() =>
			getOrTranslatePhraseInputSchema.parse({
				phrase: "hello",
				sourceLanguage: "xx",
			}),
		).toThrow();
	});
});
