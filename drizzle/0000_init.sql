CREATE TABLE "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model" text NOT NULL,
	"input" jsonb NOT NULL,
	"output" jsonb NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"audience" text NOT NULL,
	"pain_point" text DEFAULT '' NOT NULL,
	"solution" text DEFAULT '' NOT NULL,
	"proof" text DEFAULT '' NOT NULL,
	"method_name" text DEFAULT '' NOT NULL,
	"objection" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"audience" text DEFAULT '' NOT NULL,
	"funnel_stage" text DEFAULT 'TOFU' NOT NULL,
	"pain_point" text DEFAULT '' NOT NULL,
	"solution" text DEFAULT '' NOT NULL,
	"hook" text NOT NULL,
	"lock_in" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"on_screen_text" text DEFAULT '' NOT NULL,
	"visual_hook" text DEFAULT '' NOT NULL,
	"rationale" text DEFAULT '' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
