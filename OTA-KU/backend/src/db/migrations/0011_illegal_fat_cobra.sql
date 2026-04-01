ALTER TABLE "public"."account" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."account" ALTER COLUMN "status" SET DATA TYPE text;
DROP TYPE "public"."verification_status";
CREATE TYPE "public"."verification_status" AS ENUM('verified', 'unverified');
ALTER TABLE "public"."account" ALTER COLUMN "status" SET DATA TYPE "public"."verification_status" USING "status"::"public"."verification_status";
ALTER TABLE "public"."account" ALTER COLUMN "status" SET DEFAULT 'unverified';
CREATE TYPE "public"."account_status" AS ENUM('accepted', 'rejected', 'pending');
ALTER TABLE "account" ADD COLUMN "application_status" "account_status" DEFAULT 'pending' NOT NULL;
