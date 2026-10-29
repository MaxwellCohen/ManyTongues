import { describe, expect, it } from "vitest";
import {
	DEFAULT_GENERATOR_SEARCH,
	getGeneratorPalette,
	getGeneratorSearchForUrl,
	resolveGeneratorSearch,
} from "./textCloudState";

describe("resolveGeneratorSearch", () => {
	it("returns defaults when search is empty", () => {
		const result = resolveGeneratorSearch({});
		expect(result.input).toBe(DEFAULT_GENERATOR_SEARCH.input);
		expect(result.engine).toBe("experimental");
		expect(result.filterStopwords).toBe(false);
	});

	it("merges partial search", () => {
		const result = resolveGeneratorSearch({ input: "custom" });
		expect(result.input).toBe("custom");
	});

	it("handles colors array", () => {
		const result = resolveGeneratorSearch({ colors: ["#111", "#222"] });
		expect(result.colors).toEqual(["#111", "#222"]);
	});

	it("resolves classic engine from search", () => {
		const result = resolveGeneratorSearch({ engine: "classic" });
		expect(result.engine).toBe("classic");
	});
});

describe("getGeneratorSearchForUrl", () => {
	it("returns diff from defaults", () => {
		const state = { ...DEFAULT_GENERATOR_SEARCH, input: "custom" };
		expect(getGeneratorSearchForUrl(state)).toEqual({ input: "custom" });
	});

	it("omits default experimental engine", () => {
		expect(getGeneratorSearchForUrl(DEFAULT_GENERATOR_SEARCH)).toEqual({});
	});

	it("includes classic engine in URL diff", () => {
		const state = { ...DEFAULT_GENERATOR_SEARCH, engine: "classic" as const };
		expect(getGeneratorSearchForUrl(state)).toEqual({ engine: "classic" });
	});
});

describe("getGeneratorPalette", () => {
	it("returns valid hex colors", () => {
		expect(getGeneratorPalette(["#111111", "#222222"])).toEqual([
			"#111111",
			"#222222",
		]);
	});

	it("falls back to default when invalid", () => {
		expect(getGeneratorPalette(["invalid"])).toEqual(
			DEFAULT_GENERATOR_SEARCH.colors,
		);
	});
});
