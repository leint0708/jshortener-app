CREATE TABLE `short_url` (
	`id` text PRIMARY KEY NOT NULL,
	`original_url` text NOT NULL,
	`short_code` text NOT NULL,
	`user_id` text NOT NULL,
	`total_clicks` integer DEFAULT 0 NOT NULL,
	`title` text,
	`custom_alias` text,
	`expires_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`last_clicked_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `short_url_short_code_unique` ON `short_url` (`short_code`);