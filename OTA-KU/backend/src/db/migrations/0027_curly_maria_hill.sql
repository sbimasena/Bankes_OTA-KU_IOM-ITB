ALTER TABLE "transaction" RENAME COLUMN "rejection_note" TO "verif_note";--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "paid_at" DROP NOT NULL;