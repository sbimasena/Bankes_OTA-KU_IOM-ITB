ALTER TABLE "account" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "connection" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;