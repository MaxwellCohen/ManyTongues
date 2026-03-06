import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

/**
 * One row per phrase (and source language). All target-language translations
 * are stored as JSON in the `translations` column.
 */
export const phraseTranslationsTable = sqliteTable(
  'phrase_translations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    /** Source phrase (e.g. "everything will be great"). */
    phrase: text('phrase').notNull(),
    /** Source language code (e.g. "en"). */
    sourceLanguage: text('source_language').notNull().default('en'),
    /** JSON object: { "es": "...", "fr": "...", ... } */
    translations: text('translations').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex('phrase_translations_phrase_source_language_idx').on(
      table.phrase,
      table.sourceLanguage,
    ),
  ],
)

export type PhraseTranslation = typeof phraseTranslationsTable.$inferSelect
export type NewPhraseTranslation = typeof phraseTranslationsTable.$inferInsert
