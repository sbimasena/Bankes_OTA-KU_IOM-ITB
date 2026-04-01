ALTER TABLE "account_mahasiswa_detail" ALTER COLUMN "bill" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ALTER COLUMN "bill" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "amount_paid" SET DEFAULT 0;