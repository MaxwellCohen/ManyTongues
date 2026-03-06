CREATE TABLE `phrase_translations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phrase` text NOT NULL,
	`source_language` text DEFAULT 'en' NOT NULL,
	`translations` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `phrase_translations_phrase_source_language_idx` ON `phrase_translations` (`phrase`,`source_language`);