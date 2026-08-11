import { describe, expect, it } from "vitest";
import {
	DEFAULT_WORD_CLOUD_ENGINE,
	isExperimentalEngine,
	resolveWordCloudEngine,
} from "./wordCloudEngine";

describe("wordCloudEngine", () => {
	it("defaults to experimental", () => {
		expect(DEFAULT_WORD_CLOUD_ENGINE).toBe("experimental");
		expect(resolveWordCloudEngine(undefined)).toBe("experimental");
	});

	it("preserves explicit engine", () => {
		expect(resolveWordCloudEngine("classic")).toBe("classic");
		expect(resolveWordCloudEngine("experimental")).toBe("experimental");
	});

	it("detects experimental engine", () => {
		expect(isExperimentalEngine("experimental")).toBe(true);
		expect(isExperimentalEngine("classic")).toBe(false);
	});
});
