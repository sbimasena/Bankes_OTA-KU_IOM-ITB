-- Backfill data sebelum prisma db push untuk perubahan testimonial per-periode.
-- Aman dijalankan berulang (idempotent).

-- Ubah enum TestimonialStatus di database agar benar-benar hanya menyisakan
-- nilai pending/confirmed (approved/rejected dihapus dari tipe enum).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'TestimonialStatus'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'testimonial'
      AND column_name = 'status'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_type
      WHERE typname = 'TestimonialStatus_new'
    ) THEN
      CREATE TYPE "TestimonialStatus_new" AS ENUM ('pending', 'confirmed');
    END IF;

    ALTER TABLE "testimonial" ALTER COLUMN "status" DROP DEFAULT;

    ALTER TABLE "testimonial"
    ALTER COLUMN "status" TYPE "TestimonialStatus_new"
    USING (
      CASE
        WHEN "status"::text = 'approved' THEN 'confirmed'
        WHEN "status"::text = 'rejected' THEN 'pending'
        WHEN "status"::text = 'confirmed' THEN 'confirmed'
        ELSE 'pending'
      END
    )::"TestimonialStatus_new";

    DROP TYPE "TestimonialStatus";
    ALTER TYPE "TestimonialStatus_new" RENAME TO "TestimonialStatus";
    ALTER TABLE "testimonial" ALTER COLUMN "status" SET DEFAULT 'pending'::"TestimonialStatus";
  END IF;
END $$;

-- Lakukan backfill data lama.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'testimonial'
  ) THEN
    -- Pastikan kolom periodId tersedia sementara agar bisa dibackfill.
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'testimonial'
        AND column_name = 'periodId'
    ) THEN
      ALTER TABLE "testimonial" ADD COLUMN "periodId" INTEGER;
    END IF;

    -- Pastikan minimal ada 1 periode untuk menampung data testimonial lama.
    IF NOT EXISTS (SELECT 1 FROM "period") THEN
      INSERT INTO "period" ("period", "startDate", "endDate", "isCurrent", "isOpen")
      VALUES ('Periode Migrasi Legacy', NOW(), NOW(), TRUE, FALSE);
    END IF;

    -- Bersihkan metadata review lama agar konsisten dengan status baru.
    UPDATE "testimonial"
    SET
      "isActive" = FALSE,
      "rejectedReason" = NULL,
      "approvedById" = NULL,
      "approvedAt" = NULL,
      "reviewedAt" = NULL
    WHERE "status" = 'pending';

    -- Isi periodId null ke periode aktif, fallback ke periode pertama.
    WITH chosen_period AS (
      SELECT COALESCE(
        (SELECT "id" FROM "period" WHERE "isCurrent" = TRUE ORDER BY "id" DESC LIMIT 1),
        (SELECT "id" FROM "period" ORDER BY "id" ASC LIMIT 1)
      ) AS id
    )
    UPDATE "testimonial" t
    SET "periodId" = cp.id
    FROM chosen_period cp
    WHERE t."periodId" IS NULL;

    -- Jaga-jaga jika ada duplikat mahasiswaId+periodId dari data legacy.
    DELETE FROM "testimonial" t
    USING "testimonial" keep
    WHERE t."mahasiswaId" = keep."mahasiswaId"
      AND t."periodId" = keep."periodId"
      AND t."id" <> keep."id"
      AND t."updatedAt" < keep."updatedAt";
  END IF;
END $$;
