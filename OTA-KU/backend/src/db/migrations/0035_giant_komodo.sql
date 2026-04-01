CREATE TYPE "public"."transfer_status" AS ENUM('paid', 'unpaid');--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "transfer_status" "transfer_status" DEFAULT 'unpaid' NOT NULL;