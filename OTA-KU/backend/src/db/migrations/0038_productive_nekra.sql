ALTER TYPE "public"."account_type" ADD VALUE 'bankes';--> statement-breakpoint
ALTER TYPE "public"."account_type" ADD VALUE 'pengurus';--> statement-breakpoint
CREATE TABLE "account_admin_detail" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_admin_detail" ADD CONSTRAINT "account_admin_detail_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;