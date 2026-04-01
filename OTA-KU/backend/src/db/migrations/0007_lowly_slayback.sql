ALTER TABLE "account" ADD COLUMN "status" "verification_status" DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "account_ota_detail" DROP COLUMN "status";