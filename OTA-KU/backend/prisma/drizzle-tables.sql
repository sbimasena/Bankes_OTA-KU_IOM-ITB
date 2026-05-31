-- =============================================================================
-- Drizzle-exclusive tables — run AFTER prisma db push
--
-- prisma db push creates all Prisma-managed tables (users, mahasiswa_profile,
-- connection, otp, temporary_password, push_subscription, etc.) with
-- Prisma's camelCase column schema.
--
-- This script creates the ONLY tables that belong to Drizzle and do NOT
-- exist in the Prisma schema:
--   account, account_mahasiswa_detail, account_ota_detail, account_admin_detail
--
-- It also creates the Drizzle-specific PostgreSQL enum types (snake_case names)
-- which are different from Prisma's PascalCase enum types — no conflict.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS  (Drizzle uses snake_case names; Prisma uses PascalCase — no clash)
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "account_type" AS ENUM ('mahasiswa','ota','admin','bankes','pengurus');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "verification_status" AS ENUM ('verified','unverified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "account_status" AS ENUM ('accepted','rejected','pending','unregistered','reapply','outdated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "provider" AS ENUM ('credentials','azure');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "mahasiswa_status" AS ENUM ('active','inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "linkage" AS ENUM ('otm','dosen','alumni','lainnya','none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "jurusan" AS ENUM (
    'Matematika','Fisika','Astronomi','Mikrobiologi','Kimia','Biologi',
    'Sains dan Teknologi Farmasi','Aktuaria','Rekayasa Hayati','Rekayasa Pertanian',
    'Rekayasa Kehutanan','Farmasi Klinik dan Komunitas','Teknologi Pasca Panen',
    'Teknik Geologi','Teknik Pertambangan','Teknik Perminyakan','Teknik Geofisika',
    'Teknik Metalurgi','Meteorologi','Oseanografi','Teknik Kimia','Teknik Mesin',
    'Teknik Elektro','Teknik Fisika','Teknik Industri','Teknik Informatika',
    'Aeronotika dan Astronotika','Teknik Material','Teknik Pangan',
    'Manajemen Rekayasa Industri','Teknik Bioenergi dan Kemurgi','Teknik Sipil',
    'Teknik Geodesi dan Geomatika','Arsitektur','Teknik Lingkungan',
    'Perencanaan Wilayah dan Kota','Teknik Kelautan',
    'Rekayasa Infrastruktur Lingkungan','Teknik dan Pengelolaan Sumber Daya Air',
    'Seni Rupa','Desain','Kriya','Desain Interior','Desain Komunikasi Visual',
    'Desain Produk','Teknik Tenaga Listrik','Teknik Telekomunikasi',
    'Sistem Teknologi dan Informasi','Teknik Biomedis','Manajemen','Kewirausahaan','TPB'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "fakultas" AS ENUM (
    'FMIPA','SITH-S','SF','FITB','FTTM','STEI-R','FTSL','FTI','FSRD','FTMD',
    'STEI-K','SBM','SITH-R','SAPPK'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "religion" AS ENUM ('Islam','Kristen Protestan','Katolik','Hindu','Buddha','Konghucu');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "gender" AS ENUM ('M','F');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

-- account (Drizzle's user table — NOT Prisma's "users" table)
CREATE TABLE IF NOT EXISTS "account" (
  "id"                   UUID              NOT NULL DEFAULT gen_random_uuid(),
  "email"                VARCHAR(255)      NOT NULL,
  "password"             VARCHAR(255)      NOT NULL,
  "type"                 "account_type"    NOT NULL,
  "phoneNumber"          VARCHAR(32),
  "provider"             "provider"        NOT NULL DEFAULT 'credentials',
  "status"               "verification_status" NOT NULL DEFAULT 'unverified',
  "application_status"   "account_status"  NOT NULL DEFAULT 'unregistered',
  "created_at"           TIMESTAMP         NOT NULL DEFAULT now(),
  "oid"                  VARCHAR(255),
  "updated_at"           TIMESTAMP         NOT NULL DEFAULT now(),
  CONSTRAINT "account_pkey"              PRIMARY KEY ("id"),
  CONSTRAINT "account_id_unique"         UNIQUE ("id"),
  CONSTRAINT "account_email_unique"      UNIQUE ("email"),
  CONSTRAINT "account_phoneNumber_unique" UNIQUE ("phoneNumber")
);

-- account_mahasiswa_detail
-- Column names reconstructed from migration history (camelCase where Drizzle had no explicit name)
CREATE TABLE IF NOT EXISTS "account_mahasiswa_detail" (
  "account_id"                    UUID              NOT NULL,
  "name"                          VARCHAR(255),
  "nim"                           VARCHAR(8)        NOT NULL,
  "mahasiswa_status"              "mahasiswa_status" NOT NULL DEFAULT 'inactive',
  "description"                   TEXT,
  "file"                          TEXT,
  "major"                         "jurusan",
  "faculty"                       "fakultas",
  "cityOfOrigin"                  VARCHAR(255),
  "highschoolAlumni"              VARCHAR(255),
  "kk"                            TEXT,
  "ktm"                           TEXT,
  "wali_recommendation_letter"    TEXT,
  "transcript"                    TEXT,
  "salary_report"                 TEXT,
  "pbb"                           TEXT,
  "electricity_bill"              TEXT,
  "ditmawa_recommendation_letter" TEXT,
  "notes"                         TEXT,
  "admin_only_notes"              TEXT,
  "religion"                      "religion",
  "gender"                        "gender",
  "gpa"                           NUMERIC(3,2),
  "created_at"                    TIMESTAMP         NOT NULL DEFAULT now(),
  "updated_at"                    TIMESTAMP         NOT NULL DEFAULT now(),
  "due_next_update_at"            TIMESTAMP         NOT NULL DEFAULT now(),
  "bill"                          INTEGER           NOT NULL DEFAULT 0,
  CONSTRAINT "account_mahasiswa_detail_pkey"          PRIMARY KEY ("account_id"),
  CONSTRAINT "account_mahasiswa_detail_nim_unique"    UNIQUE ("nim"),
  CONSTRAINT "account_mahasiswa_detail_account_id_account_id_fk"
    FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- account_ota_detail
CREATE TABLE IF NOT EXISTS "account_ota_detail" (
  "account_id"           UUID         NOT NULL,
  "name"                 VARCHAR(255) NOT NULL,
  "job"                  VARCHAR(255) NOT NULL,
  "address"              VARCHAR(255) NOT NULL,
  "linkage"              "linkage"    NOT NULL,
  "funds"                INTEGER      NOT NULL,
  "max_capacity"         INTEGER      NOT NULL,
  "start_date"           TIMESTAMP    NOT NULL,
  "max_semester"         INTEGER      NOT NULL,
  "transfer_date"        INTEGER      NOT NULL,
  "criteria"             TEXT         NOT NULL,
  "allow_admin_selection" BOOLEAN     NOT NULL DEFAULT false,
  "created_at"           TIMESTAMP    NOT NULL DEFAULT now(),
  "updated_at"           TIMESTAMP    NOT NULL DEFAULT now(),
  "is_detail_visible"    BOOLEAN      NOT NULL DEFAULT false,
  CONSTRAINT "account_ota_detail_pkey" PRIMARY KEY ("account_id"),
  CONSTRAINT "account_ota_detail_account_id_account_id_fk"
    FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- account_admin_detail
CREATE TABLE IF NOT EXISTS "account_admin_detail" (
  "account_id" UUID         NOT NULL,
  "name"       VARCHAR(255) NOT NULL,
  CONSTRAINT "account_admin_detail_pkey" PRIMARY KEY ("account_id"),
  CONSTRAINT "account_admin_detail_account_id_account_id_fk"
    FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
