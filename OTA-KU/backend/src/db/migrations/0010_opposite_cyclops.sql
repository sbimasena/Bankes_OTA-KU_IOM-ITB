ALTER TYPE "public"."verification_status" ADD VALUE 'pending';--> statement-breakpoint
COMMIT;
ALTER TABLE "account" ALTER COLUMN "status" SET DEFAULT 'pending';