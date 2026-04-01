CREATE TYPE "public"."account_type" AS ENUM('mahasiswa', 'ota', 'admin');--> statement-breakpoint
CREATE TYPE "public"."linkage" AS ENUM('otm', 'dosen', 'alumni', 'lainnya', 'none');--> statement-breakpoint
CREATE TYPE "public"."mahasiswa_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('verified', 'unverified');--> statement-breakpoint
CREATE TABLE "account_mahasiswa_detail" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phoneNumber" varchar(32) NOT NULL,
	"nim" varchar(8) NOT NULL,
	"status" "verification_status" DEFAULT 'unverified' NOT NULL,
	"mahasiswa_status" "mahasiswa_status" DEFAULT 'inactive' NOT NULL,
	CONSTRAINT "account_mahasiswa_detail_phoneNumber_unique" UNIQUE("phoneNumber"),
	CONSTRAINT "account_mahasiswa_detail_nim_unique" UNIQUE("nim")
);
--> statement-breakpoint
CREATE TABLE "account_ota_detail" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phoneNumber" varchar(32) NOT NULL,
	"job" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"linkage" "linkage" NOT NULL,
	"funds" integer NOT NULL,
	"max_capacity" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"max_semester" integer NOT NULL,
	"transfer_date" integer NOT NULL,
	"criteria" text NOT NULL,
	"status" "verification_status" DEFAULT 'unverified' NOT NULL,
	CONSTRAINT "account_ota_detail_phoneNumber_unique" UNIQUE("phoneNumber")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"type" "account_type" NOT NULL,
	CONSTRAINT "account_id_unique" UNIQUE("id"),
	CONSTRAINT "account_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "connection" (
	"mahasiswa_id" uuid NOT NULL,
	"ota_id" uuid NOT NULL,
	CONSTRAINT "connection_mahasiswa_id_ota_id_pk" PRIMARY KEY("mahasiswa_id","ota_id")
);
--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD CONSTRAINT "account_mahasiswa_detail_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_ota_detail" ADD CONSTRAINT "account_ota_detail_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_mahasiswa_id_account_mahasiswa_detail_account_id_fk" FOREIGN KEY ("mahasiswa_id") REFERENCES "public"."account_mahasiswa_detail"("account_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_ota_id_account_ota_detail_account_id_fk" FOREIGN KEY ("ota_id") REFERENCES "public"."account_ota_detail"("account_id") ON DELETE cascade ON UPDATE no action;