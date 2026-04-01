CREATE TABLE "otp" (
	"account_id" uuid NOT NULL,
	"code" varchar(6) NOT NULL,
	"expired_at" timestamp NOT NULL,
	CONSTRAINT "otp_account_id_code_pk" PRIMARY KEY("account_id","code")
);
--> statement-breakpoint
ALTER TABLE "otp" ADD CONSTRAINT "otp_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;