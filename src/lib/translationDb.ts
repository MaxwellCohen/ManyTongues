import { and, eq } from "drizzle-orm";
import { phraseTranslationsTable } from "#/db/schema";
import { getTursoDb } from "#/lib/db";
import { isTursoConfigured, TRANSLATOR_DB_NOT_CONFIGURED } from "#/lib/turso";

export async function getExistingPhraseTranslation(
	phrase: string,
	sourceLanguage: string,
): Promise<
	| { error: string }
	| { existingTranslationsJson: string | null }
> {
	if (!isTursoConfigured()) {
		return { error: TRANSLATOR_DB_NOT_CONFIGURED };
	}

	const db = getTursoDb();
	const existing = await db
		.select()
		.from(phraseTranslationsTable)
		.where(
			and(
				eq(phraseTranslationsTable.phrase, phrase),
				eq(phraseTranslationsTable.sourceLanguage, sourceLanguage),
			),
		)
		.limit(1);

	return { existingTranslationsJson: existing[0]?.translations ?? null };
}

export async function storePhraseTranslations(
	phrase: string,
	sourceLanguage: string,
	translations: Record<string, string>,
): Promise<
	| { ok: true; translations: Record<string, string> }
	| { ok: false; error: string }
> {
	if (Object.keys(translations).length === 0) {
		return { ok: false, error: "No translations succeeded." };
	}

	try {
		const db = getTursoDb();
		await db
			.insert(phraseTranslationsTable)
			.values({
				phrase,
				sourceLanguage,
				translations: JSON.stringify(translations),
			})
			.onConflictDoUpdate({
				target: [
					phraseTranslationsTable.phrase,
					phraseTranslationsTable.sourceLanguage,
				],
				set: { translations: JSON.stringify(translations) },
			});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return { ok: false, error: `Failed to save translations: ${message}` };
	}

	return { ok: true, translations };
}
