

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
      CREATE TYPE "TestimonialStatus_new" AS ENUM ('shown', 'not_shown');
    END IF;

    ALTER TABLE "testimonial" ALTER COLUMN "status" DROP DEFAULT;

    ALTER TABLE "testimonial"
    ALTER COLUMN "status" TYPE "TestimonialStatus_new"
    USING (
      CASE
        WHEN "status"::text IN ('approved', 'confirmed', 'shown') THEN 'shown'
        WHEN "status"::text IN ('rejected', 'pending', 'not_shown') THEN 'not_shown'
        ELSE 'not_shown'
      END
    )::"TestimonialStatus_new";

    DROP TYPE "TestimonialStatus";
    ALTER TYPE "TestimonialStatus_new" RENAME TO "TestimonialStatus";
    ALTER TABLE "testimonial" ALTER COLUMN "status" SET DEFAULT 'not_shown'::"TestimonialStatus";
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
    -- Pastikan kolom otaId tersedia sementara agar bisa dibackfill.
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'testimonial'
        AND column_name = 'otaId'
    ) THEN
      ALTER TABLE "testimonial" ADD COLUMN "otaId" UUID;
    END IF;

    -- Isi otaId null dari koneksi accepted terbaru milik mahasiswa.
    WITH ranked_connection AS (
      SELECT
        c."mahasiswaId",
        c."otaId",
        ROW_NUMBER() OVER (
          PARTITION BY c."mahasiswaId"
          ORDER BY c."updatedAt" DESC, c."createdAt" DESC
        ) AS rn
      FROM "connection" c
      WHERE c."connectionStatus" = 'accepted'
    )
    UPDATE "testimonial" t
    SET "otaId" = rc."otaId"
    FROM ranked_connection rc
    WHERE t."mahasiswaId" = rc."mahasiswaId"
      AND rc.rn = 1
      AND t."otaId" IS NULL;

    -- Hapus testimoni tanpa relasi OTA accepted agar konsisten dengan model baru.
    DELETE FROM "testimonial"
    WHERE "otaId" IS NULL;

    -- Bersihkan metadata review untuk yang tidak ditampilkan.
    UPDATE "testimonial"
    SET
      "isActive" = FALSE
    WHERE "status" = 'not_shown';

    -- Jaga-jaga jika ada duplikat testimonial per mahasiswa dari data legacy.
    DELETE FROM "testimonial" t
    USING "testimonial" keep
    WHERE t."mahasiswaId" = keep."mahasiswaId"
      AND t."id" <> keep."id"
      AND t."updatedAt" < keep."updatedAt";
  END IF;
END $$;