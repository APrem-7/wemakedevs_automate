CREATE TABLE `revision_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`workflow_id` text NOT NULL,
	`topic` text NOT NULL,
	`events` text NOT NULL,
	`next_review` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`topic` text NOT NULL,
	`source` text NOT NULL,
	`source_type` text NOT NULL,
	`status` text DEFAULT 'preview' NOT NULL,
	`steps` text NOT NULL,
	`output_link` text,
	`created_at` integer NOT NULL,
	`completed_at` integer
);
