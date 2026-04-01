CREATE TYPE "public"."provider" AS ENUM('credentials', 'azure');--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "provider" "provider" DEFAULT 'credentials' NOT NULL;