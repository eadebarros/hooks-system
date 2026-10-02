ALTER TABLE "personas" ADD COLUMN "niche" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "personas" ADD COLUMN "desires" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "personas" ADD COLUMN "language" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "personas" ADD COLUMN "conversation" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "personas" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "scripts" ADD COLUMN "persona_id" uuid;--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE set null ON UPDATE no action;