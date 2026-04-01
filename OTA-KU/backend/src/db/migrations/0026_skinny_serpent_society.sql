ALTER TABLE "transaction" DROP CONSTRAINT "transaction_mahasiswa_id_ota_id_pk";--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_mahasiswa_id_ota_id_created_at_pk" PRIMARY KEY("mahasiswa_id","ota_id","created_at");--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "rejection_note" text;