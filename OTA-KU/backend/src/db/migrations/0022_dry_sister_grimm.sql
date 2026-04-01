CREATE TABLE "temporary_password" (
	"account_id" uuid NOT NULL,
	"password" varchar(16) NOT NULL,
	"expired_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	CONSTRAINT "temporary_password_account_id_password_pk" PRIMARY KEY("account_id","password")
);
--> statement-breakpoint
ALTER TABLE "temporary_password" ADD CONSTRAINT "temporary_password_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;