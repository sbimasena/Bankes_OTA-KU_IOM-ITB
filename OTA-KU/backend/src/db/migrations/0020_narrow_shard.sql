CREATE TYPE "public"."gender" AS ENUM('M', 'F');--> statement-breakpoint
CREATE TYPE "public"."religion" AS ENUM('Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'paid', 'unpaid');--> statement-breakpoint
ALTER TYPE "public"."account_status" ADD VALUE 'reapply';--> statement-breakpoint
ALTER TYPE "public"."account_status" ADD VALUE 'outdated';--> statement-breakpoint
CREATE TABLE "transaction" (
	"mahasiswa_id" uuid NOT NULL,
	"ota_id" uuid NOT NULL,
	"bill" integer NOT NULL,
	"amount_paid" integer NOT NULL,
	"paid_at" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"transaction_status" "transaction_status" DEFAULT 'unpaid' NOT NULL,
	"transaction_receipt" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_mahasiswa_id_ota_id_pk" PRIMARY KEY("mahasiswa_id","ota_id")
);
--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "religion" "religion";--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "gender" "gender";--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "gpa" integer;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "due_next_update_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account_ota_detail" ADD COLUMN "allow_admin_selection" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "account_ota_detail" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account_ota_detail" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "connection" ADD COLUMN "request_terminate_ota" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "connection" ADD COLUMN "request_terminate_mahasiswa" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "connection" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_mahasiswa_id_account_mahasiswa_detail_account_id_fk" FOREIGN KEY ("mahasiswa_id") REFERENCES "public"."account_mahasiswa_detail"("account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_ota_id_account_ota_detail_account_id_fk" FOREIGN KEY ("ota_id") REFERENCES "public"."account_ota_detail"("account_id") ON DELETE cascade ON UPDATE no action;