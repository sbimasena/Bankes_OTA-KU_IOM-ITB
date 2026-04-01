ALTER TABLE "account_mahasiswa_detail" DROP CONSTRAINT "account_mahasiswa_detail_phoneNumber_unique";--> statement-breakpoint
ALTER TABLE "account_ota_detail" DROP CONSTRAINT "account_ota_detail_phoneNumber_unique";--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "phoneNumber" varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" DROP COLUMN "phoneNumber";--> statement-breakpoint
ALTER TABLE "account_ota_detail" DROP COLUMN "phoneNumber";--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_phoneNumber_unique" UNIQUE("phoneNumber");