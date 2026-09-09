CREATE TABLE `art_directions` (
	`id` text PRIMARY KEY NOT NULL,
	`development_id` text NOT NULL,
	`content_json` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`development_id`) REFERENCES `creative_developments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_art_direction_development` ON `art_directions` (`development_id`);--> statement-breakpoint
CREATE TABLE `canvases` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`scene_file_key` text NOT NULL,
	`preview_file_key` text,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_canvases_project_kind` ON `canvases` (`project_id`,`kind`);--> statement-breakpoint
CREATE TABLE `competitors` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`positioning` text,
	`audience` text,
	`products` text,
	`pricing` text,
	`visual_language` text,
	`campaign_patterns` text,
	`messaging` text,
	`content_patterns` text,
	`strengths` text,
	`weaknesses` text,
	`similarities` text,
	`differences` text,
	`evidence_json` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_competitors_project` ON `competitors` (`project_id`);--> statement-breakpoint
CREATE TABLE `creative_developments` (
	`id` text PRIMARY KEY NOT NULL,
	`opportunity_id` text NOT NULL,
	`content_json` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_developments_opportunity` ON `creative_developments` (`opportunity_id`);--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`decision` text NOT NULL,
	`note` text,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_feedback_project` ON `feedback` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_feedback_entity` ON `feedback` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `findings` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`source_id` text,
	`category` text NOT NULL,
	`classification` text NOT NULL,
	`finding` text NOT NULL,
	`source_label` text NOT NULL,
	`source_url` text,
	`observedAt` text NOT NULL,
	`confidence` text NOT NULL,
	`relevance` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_findings_project_category` ON `findings` (`project_id`,`category`);--> statement-breakpoint
CREATE INDEX `idx_findings_source` ON `findings` (`source_id`);--> statement-breakpoint
CREATE TABLE `handoffs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`recipient` text NOT NULL,
	`content_json` text NOT NULL,
	`canvas_id` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`canvas_id`) REFERENCES `canvases`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_handoffs_project_recipient` ON `handoffs` (`project_id`,`recipient`);--> statement-breakpoint
CREATE TABLE `memory_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`field` text NOT NULL,
	`value` text NOT NULL,
	`confidence` text NOT NULL,
	`evidence_json` text DEFAULT '[]' NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_memory_project_field` ON `memory_entries` (`project_id`,`field`);--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`one_line` text NOT NULL,
	`observed` text NOT NULL,
	`why_it_matters` text NOT NULL,
	`audience` text NOT NULL,
	`tension` text NOT NULL,
	`evidence_json` text NOT NULL,
	`counter_evidence` text,
	`why_this_project` text NOT NULL,
	`why_now` text NOT NULL,
	`creative_possibility` text NOT NULL,
	`risk` text NOT NULL,
	`originality` integer NOT NULL,
	`brand_fit` integer NOT NULL,
	`evidence_strength` integer NOT NULL,
	`feasibility` integer NOT NULL,
	`confidence` text NOT NULL,
	`recommendation` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`edited_at` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_opportunities_project_status` ON `opportunities` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`mode` text NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`brief` text NOT NULL,
	`objective` text NOT NULL,
	`audience` text,
	`references_json` text DEFAULT '[]' NOT NULL,
	`competitors_json` text DEFAULT '[]' NOT NULL,
	`notes` text,
	`release_type` text,
	`release_name` text,
	`themes_json` text DEFAULT '[]' NOT NULL,
	`release_date` text,
	`user_lyrics` text,
	`collaborators_json` text DEFAULT '[]' NOT NULL,
	`stage` text DEFAULT 'UNDERSTANDING' NOT NULL,
	`is_demo` integer DEFAULT false NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_projects_updated_at` ON `projects` (`updatedAt`);--> statement-breakpoint
CREATE TABLE `signals` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`evidence_json` text NOT NULL,
	`strength` text NOT NULL,
	`confidence` text NOT NULL,
	`freshness` text NOT NULL,
	`creative_relevance` text NOT NULL,
	`implication` text NOT NULL,
	`counter_evidence` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_signals_project_type` ON `signals` (`project_id`,`type`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`source_url` text,
	`file_key` text,
	`content` text,
	`status` text DEFAULT 'READY' NOT NULL,
	`capturedAt` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sources_project` ON `sources` (`project_id`);--> statement-breakpoint
CREATE TABLE `storyboards` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`frames_json` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_storyboards_project` ON `storyboards` (`project_id`);
--> statement-breakpoint
PRAGMA optimize;
