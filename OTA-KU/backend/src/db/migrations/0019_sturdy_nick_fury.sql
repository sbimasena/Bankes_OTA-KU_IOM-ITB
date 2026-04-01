ALTER TYPE "public"."account_status" ADD VALUE 'unregistered';--> statement-breakpoint
COMMIT;
ALTER TABLE "account" ALTER COLUMN "application_status" SET DEFAULT 'unregistered';