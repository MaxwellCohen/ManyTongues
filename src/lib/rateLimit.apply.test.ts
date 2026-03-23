import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { returningMock } = vi.hoisted(() => ({ returningMock: vi.fn() }));

vi.mock("#/lib/db", () => ({
	getTursoDb: vi.fn(() => ({
		insert: () => ({
			values: vi.fn().mockReturnThis(),
			onConflictDoUpdate: vi.fn().mockReturnThis(),
			returning: returningMock,
		}),
	})),
}));

import { applyTranslatorRateLimit } from "./rateLimit";

describe("applyTranslatorRateLimit", () => {
	const prevDbUrl = process.env.DB_URL;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		process.env.DB_URL = prevDbUrl;
	});

	it("does not limit when DB_URL is unset", async () => {
		delete process.env.DB_URL;
		const r = await applyTranslatorRateLimit("192.168.1.1");
		expect(r).toEqual({ limited: false });
		expect(returningMock).not.toHaveBeenCalled();
	});

	it("returns limited when hits exceed max in window", async () => {
		process.env.DB_URL = "libsql://test.db";
		const now = Date.now();
		const windowMs = 5 * 60 * 1000;
		const windowStartedAtMs = now - (now % windowMs);
		returningMock.mockResolvedValue([{ hits: 11, windowStartedAtMs }]);

		const r = await applyTranslatorRateLimit("10.0.0.1");

		expect(r.limited).toBe(true);
		if (r.limited) {
			expect(r.message).toContain("Too many translation requests");
			expect(r.retryAfterSeconds).toBeGreaterThan(0);
		}
	});

	it("returns not limited when hits within max", async () => {
		process.env.DB_URL = "libsql://test.db";
		const now = Date.now();
		const windowMs = 5 * 60 * 1000;
		const windowStartedAtMs = now - (now % windowMs);
		returningMock.mockResolvedValue([{ hits: 3, windowStartedAtMs }]);

		const r = await applyTranslatorRateLimit("10.0.0.2");
		expect(r).toEqual({ limited: false });
	});
});
