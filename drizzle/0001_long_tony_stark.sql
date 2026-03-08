CREATE TABLE `translator_rate_limits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`window_started_at_ms` integer NOT NULL,
	`hits` integer DEFAULT 0 NOT NULL,
	`updated_at_ms` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `translator_rate_limits_key_idx` ON `translator_rate_limits` (`key`);