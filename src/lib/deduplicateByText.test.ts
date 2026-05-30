import { describe, expect, it } from "vitest";
import {
	deduplicateCloudWordsByText,
	deduplicateTranslationsByValue,
} from "./deduplicateByText";

describe("deduplicateTranslationsByValue", () => {
	it("keeps one language per unique text", () => {
		expect(
			deduplicateTranslationsByValue({
				fr: "hello",
				es: "hello",
				de: "hallo",
			}),
		).toEqual({ fr: "hello", de: "hallo" });
	});

	it("skips empty strings", () => {
		expect(
			deduplicateTranslationsByValue({ fr: "", es: "hola" }),
		).toEqual({ es: "hola" });
	});
});

describe("deduplicateCloudWordsByText", () => {
	it("keeps max weight per text", () => {
		expect(
			deduplicateCloudWordsByText([
				{ text: "hi", value: 2 },
				{ text: "hi", value: 5 },
				{ text: "bye", value: 3 },
			]),
		).toEqual([
			{ text: "hi", value: 5 },
			{ text: "bye", value: 3 },
		]);
	});
});
