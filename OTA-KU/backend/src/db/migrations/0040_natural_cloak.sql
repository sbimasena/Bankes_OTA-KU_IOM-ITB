ALTER TABLE "connection" RENAME COLUMN "request_termination_note" TO "request_termination_note_ota";--> statement-breakpoint
ALTER TABLE "connection" ADD COLUMN "request_termination_note_ma" text;