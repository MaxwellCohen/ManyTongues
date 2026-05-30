/** Shown when the Translator runs without Turso (`DB_URL`). */
export const TRANSLATOR_DB_NOT_CONFIGURED =
	"Database is not configured (DB_URL).";

/** Whether Turso persistence (phrase cache + rate limits) is available. */
export function isTursoConfigured(): boolean {
	return Boolean(process.env.DB_URL?.trim());
}
