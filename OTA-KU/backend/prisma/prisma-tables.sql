-- =============================================================================
-- Prisma-specific tables — run AFTER drizzle-kit migrate
--
-- Drizzle manages:  account, account_mahasiswa_detail, account_ota_detail,
--                   account_admin_detail, connection, transaction, otp,
--                   temporary_password, push_subscription
-- Prisma manages:   everything below (different table names / no overlap with
--                   the Drizzle-managed set, except the five tables above which
--                   Drizzle already created and Prisma must NOT recreate).
--
-- All statements use IF NOT EXISTS / DO-EXCEPTION so the script is idempotent.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS  (Prisma uses PascalCase type names; Drizzle uses snake_case — no clash)
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('admin','mahasiswa','guest','pengurus','pewawancara','ota','bankes');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "VerificationStatus" AS ENUM ('verified','unverified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ApplicationStatus" AS ENUM ('accepted','rejected','pending','unregistered','reapply','outdated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "Provider" AS ENUM ('credentials','azure','keycloak');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "Jurusan" AS ENUM (
    'Matematika','Fisika','Astronomi','Mikrobiologi','Kimia','Biologi',
    'Sains_dan_Teknologi_Farmasi','Aktuaria','Rekayasa_Hayati','Rekayasa_Pertanian',
    'Rekayasa_Kehutanan','Farmasi_Klinik_dan_Komunitas','Teknologi_Pasca_Panen',
    'Teknik_Geologi','Teknik_Pertambangan','Teknik_Perminyakan','Teknik_Geofisika',
    'Teknik_Metalurgi','Meteorologi','Oseanografi','Teknik_Kimia','Teknik_Mesin',
    'Teknik_Elektro','Teknik_Fisika','Teknik_Industri','Teknik_Informatika',
    'Aeronotika_dan_Astronotika','Teknik_Material','Teknik_Pangan',
    'Manajemen_Rekayasa_Industri','Teknik_Bioenergi_dan_Kemurgi','Teknik_Sipil',
    'Teknik_Geodesi_dan_Geomatika','Arsitektur','Teknik_Lingkungan',
    'Perencanaan_Wilayah_dan_Kota','Teknik_Kelautan',
    'Rekayasa_Infrastruktur_Lingkungan','Teknik_dan_Pengelolaan_Sumber_Daya_Air',
    'Seni_Rupa','Desain','Kriya','Desain_Interior','Desain_Komunikasi_Visual',
    'Desain_Produk','Teknik_Tenaga_Listrik','Teknik_Telekomunikasi',
    'Sistem_Teknologi_dan_Informasi','Teknik_Biomedis','Manajemen','Kewirausahaan','TPB'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "Fakultas" AS ENUM (
    'FMIPA','SITH-S','SF','FITB','FTTM','STEI-R','FTSL','FTI','FSRD','FTMD',
    'STEI-K','SBM','SITH-R','SAPPK'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "StudentFileType" AS ENUM (
    'KTP','CV','Transkrip_Nilai','Essay','STNK','SIM','KK','KTM',
    'Wali_Recommendation_Letter','Transcript','Salary_Report','PBB',
    'Electricity_Bill','Ditmawa_Recommendation_Letter','Profile_Photo'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "Linkage" AS ENUM ('otm','dosen','alumni','lainnya','none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MahasiswaStatus" AS ENUM ('active','inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ConnectionStatus" AS ENUM ('accepted','rejected','pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PeriodStatus" AS ENUM ('active','ended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TransactionStatus" AS ENUM ('pending','paid','unpaid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TransferStatus" AS ENUM ('paid','unpaid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OtaGroupStatus" AS ENUM ('forming','active');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "GroupInvitationStatus" AS ENUM ('pending','accepted','rejected','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProposalStatus" AS ENUM ('open','failed','passed','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TestimonialStatus" AS ENUM ('shown','not_shown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ScoreCategory" AS ENUM ('KURANG','CUKUP','BAIK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- TABLES  (dependency order: parents before children)
-- ---------------------------------------------------------------------------

-- users  (Prisma User model — NOT the same as Drizzle's "account" table)
CREATE TABLE IF NOT EXISTS "users" (
  "id"                 UUID          NOT NULL DEFAULT gen_random_uuid(),
  "email"              VARCHAR(255)  NOT NULL,
  "phoneNumber"        VARCHAR(32),
  "password"           VARCHAR(255),
  "name"               TEXT,
  "role"               "Role"        NOT NULL,
  "provider"           "Provider"    NOT NULL DEFAULT 'credentials',
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'unverified',
  "applicationStatus"  "ApplicationStatus"  NOT NULL DEFAULT 'unregistered',
  "oid"                VARCHAR(255),
  "createdAt"          TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey"         PRIMARY KEY ("id"),
  CONSTRAINT "users_email_key"    UNIQUE ("email"),
  CONSTRAINT "users_phoneNumber_key" UNIQUE ("phoneNumber")
);

-- period
CREATE TABLE IF NOT EXISTS "period" (
  "id"        SERIAL       NOT NULL,
  "period"    TEXT         NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate"   TIMESTAMP(3) NOT NULL,
  "isCurrent" BOOLEAN      NOT NULL,
  "isOpen"    BOOLEAN      NOT NULL,
  CONSTRAINT "period_pkey" PRIMARY KEY ("id")
);

-- question
CREATE TABLE IF NOT EXISTS "question" (
  "id"       SERIAL NOT NULL,
  "question" TEXT   NOT NULL,
  CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- mahasiswa_profile  (child of users)
CREATE TABLE IF NOT EXISTS "mahasiswa_profile" (
  "userId"          UUID              NOT NULL,
  "nim"             VARCHAR(8)        NOT NULL,
  "name"            VARCHAR(255),
  "faculty"         "Fakultas",
  "major"           "Jurusan",
  "cityOfOrigin"    VARCHAR(255),
  "highschoolAlumni" VARCHAR(255),
  "religion"        VARCHAR(50),
  "gender"          VARCHAR(1),
  "gpa"             DECIMAL(3,2),
  "description"     TEXT,
  "bill"            INTEGER           NOT NULL DEFAULT 0,
  "notes"           TEXT,
  "adminOnlyNotes"  TEXT,
  "mahasiswaStatus" "MahasiswaStatus" NOT NULL DEFAULT 'inactive',
  "dueNextUpdateAt" TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"       TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "mahasiswa_profile_pkey"    PRIMARY KEY ("userId"),
  CONSTRAINT "mahasiswa_profile_nim_key" UNIQUE ("nim"),
  CONSTRAINT "mahasiswa_profile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- student_file  (child of mahasiswa_profile)
CREATE TABLE IF NOT EXISTS "student_file" (
  "id"         UUID              NOT NULL DEFAULT gen_random_uuid(),
  "userId"     UUID              NOT NULL,
  "fileUrl"    TEXT              NOT NULL,
  "fileName"   TEXT              NOT NULL,
  "type"       "StudentFileType" NOT NULL,
  "bucketName" TEXT              NOT NULL DEFAULT 'documents-bucket',
  "createdAt"  TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "student_file_pkey"             PRIMARY KEY ("id"),
  CONSTRAINT "student_file_userId_type_key"  UNIQUE ("userId","type"),
  CONSTRAINT "student_file_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "mahasiswa_profile"("userId") ON DELETE CASCADE
);

-- ota_profile  (child of users)
CREATE TABLE IF NOT EXISTS "ota_profile" (
  "userId"             UUID         NOT NULL,
  "name"               VARCHAR(255) NOT NULL,
  "job"                VARCHAR(255) NOT NULL,
  "address"            VARCHAR(255) NOT NULL,
  "linkage"            "Linkage"    NOT NULL,
  "funds"              INTEGER      NOT NULL,
  "maxCapacity"        INTEGER      NOT NULL,
  "startDate"          TIMESTAMP(3) NOT NULL,
  "maxSemester"        INTEGER      NOT NULL,
  "transferDate"       INTEGER      NOT NULL,
  "criteria"           TEXT         NOT NULL,
  "isDetailVisible"    BOOLEAN      NOT NULL DEFAULT false,
  "allowAdminSelection" BOOLEAN     NOT NULL DEFAULT false,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ota_profile_pkey" PRIMARY KEY ("userId"),
  CONSTRAINT "ota_profile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- admin_profile  (child of users)
CREATE TABLE IF NOT EXISTS "admin_profile" (
  "userId" UUID         NOT NULL,
  "name"   VARCHAR(255) NOT NULL,
  CONSTRAINT "admin_profile_pkey" PRIMARY KEY ("userId"),
  CONSTRAINT "admin_profile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- notification  (child of users)
CREATE TABLE IF NOT EXISTS "notification" (
  "id"        SERIAL       NOT NULL,
  "userId"    UUID         NOT NULL,
  "header"    TEXT         NOT NULL,
  "body"      TEXT         NOT NULL,
  "url"       TEXT,
  "hasRead"   BOOLEAN      NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notification_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "notification_userId_idx" ON "notification"("userId");

-- interview_slot  (child of users, period, mahasiswa_profile)
CREATE TABLE IF NOT EXISTS "interview_slot" (
  "id"          SERIAL       NOT NULL,
  "title"       TEXT,
  "description" TEXT,
  "createdById" UUID         NOT NULL,
  "periodId"    INTEGER      NOT NULL,
  "startTime"   TIMESTAMP(3) NOT NULL,
  "endTime"     TIMESTAMP(3) NOT NULL,
  "studentId"   UUID,
  "bookedAt"    TIMESTAMP(3),
  CONSTRAINT "interview_slot_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "interview_slot_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "interview_slot_periodId_fkey"
    FOREIGN KEY ("periodId") REFERENCES "period"("id") ON DELETE CASCADE,
  CONSTRAINT "interview_slot_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "mahasiswa_profile"("userId") ON DELETE CASCADE
);

-- interview_participant  (child of interview_slot, users)
CREATE TABLE IF NOT EXISTS "interview_participant" (
  "id"       SERIAL       NOT NULL,
  "slotId"   INTEGER      NOT NULL,
  "userId"   UUID         NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "interview_participant_pkey"             PRIMARY KEY ("id"),
  CONSTRAINT "interview_participant_slotId_userId_key" UNIQUE ("slotId","userId"),
  CONSTRAINT "interview_participant_slotId_fkey"
    FOREIGN KEY ("slotId") REFERENCES "interview_slot"("id") ON DELETE CASCADE,
  CONSTRAINT "interview_participant_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- interview_note  (child of interview_slot, mahasiswa_profile)
CREATE TABLE IF NOT EXISTS "interview_note" (
  "slotId" INTEGER NOT NULL,
  "userId" UUID    NOT NULL,
  "text"   TEXT    NOT NULL,
  CONSTRAINT "interview_note_pkey" PRIMARY KEY ("slotId","userId"),
  CONSTRAINT "interview_note_slotId_fkey"
    FOREIGN KEY ("slotId") REFERENCES "interview_slot"("id") ON DELETE CASCADE,
  CONSTRAINT "interview_note_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "mahasiswa_profile"("userId") ON DELETE CASCADE
);

-- bankes_status  (child of mahasiswa_profile, period)
CREATE TABLE IF NOT EXISTS "bankes_status" (
  "userId"        UUID    NOT NULL,
  "periodId"      INTEGER NOT NULL,
  "passDitmawa"   BOOLEAN NOT NULL,
  "passIOM"       BOOLEAN NOT NULL,
  "passInterview" BOOLEAN NOT NULL,
  "amount"        INTEGER,
  CONSTRAINT "bankes_status_pkey" PRIMARY KEY ("userId","periodId"),
  CONSTRAINT "bankes_status_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "mahasiswa_profile"("userId") ON DELETE CASCADE,
  CONSTRAINT "bankes_status_periodId_fkey"
    FOREIGN KEY ("periodId") REFERENCES "period"("id") ON DELETE CASCADE
);

-- score_matrix  (child of mahasiswa_profile, period, question)
CREATE TABLE IF NOT EXISTS "score_matrix" (
  "userId"        UUID            NOT NULL,
  "periodId"      INTEGER         NOT NULL,
  "questionId"    INTEGER         NOT NULL,
  "scoreCategory" "ScoreCategory" NOT NULL,
  "comment"       TEXT            NOT NULL,
  CONSTRAINT "score_matrix_pkey" PRIMARY KEY ("userId","periodId","questionId"),
  CONSTRAINT "score_matrix_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "mahasiswa_profile"("userId") ON DELETE CASCADE,
  CONSTRAINT "score_matrix_periodId_fkey"
    FOREIGN KEY ("periodId") REFERENCES "period"("id") ON DELETE CASCADE,
  CONSTRAINT "score_matrix_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE
);

-- ota_group  (child of users)
CREATE TABLE IF NOT EXISTS "ota_group" (
  "id"              UUID           NOT NULL DEFAULT gen_random_uuid(),
  "name"            VARCHAR(255)   NOT NULL,
  "description"     TEXT,
  "status"          "OtaGroupStatus" NOT NULL DEFAULT 'forming',
  "criteria"        TEXT,
  "transferDate"    INTEGER,
  "autoMatchConsent" BOOLEAN       NOT NULL DEFAULT false,
  "createdById"     UUID           NOT NULL,
  "createdAt"       TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ota_group_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ota_group_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id")
);

-- testimonial  (child of mahasiswa_profile, ota_profile, ota_group)
CREATE TABLE IF NOT EXISTS "testimonial" (
  "id"          UUID               NOT NULL DEFAULT gen_random_uuid(),
  "mahasiswaId" UUID               NOT NULL,
  "otaId"       UUID,
  "groupId"     UUID,
  "content"     TEXT               NOT NULL,
  "imageUrls"   TEXT[]             NOT NULL,
  "status"      "TestimonialStatus" NOT NULL DEFAULT 'not_shown',
  "isActive"    BOOLEAN            NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "testimonial_pkey"          PRIMARY KEY ("id"),
  CONSTRAINT "testimonial_mahasiswaId_key" UNIQUE ("mahasiswaId"),
  CONSTRAINT "testimonial_mahasiswaId_fkey"
    FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa_profile"("userId") ON DELETE CASCADE,
  CONSTRAINT "testimonial_otaId_fkey"
    FOREIGN KEY ("otaId") REFERENCES "ota_profile"("userId") ON DELETE CASCADE,
  CONSTRAINT "testimonial_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "ota_group"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "testimonial_status_isActive_updatedAt_idx"
  ON "testimonial"("status","isActive","updatedAt");

-- ota_group_member  (child of ota_group, ota_profile)
CREATE TABLE IF NOT EXISTS "ota_group_member" (
  "groupId"      UUID         NOT NULL,
  "otaId"        UUID         NOT NULL,
  "pledgeAmount" INTEGER      NOT NULL DEFAULT 0,
  "joinedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ota_group_member_pkey" PRIMARY KEY ("groupId","otaId"),
  CONSTRAINT "ota_group_member_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "ota_group"("id") ON DELETE CASCADE,
  CONSTRAINT "ota_group_member_otaId_fkey"
    FOREIGN KEY ("otaId") REFERENCES "ota_profile"("userId") ON DELETE CASCADE
);

-- group_invitation  (child of ota_group, ota_profile)
CREATE TABLE IF NOT EXISTS "group_invitation" (
  "id"             UUID                   NOT NULL DEFAULT gen_random_uuid(),
  "groupId"        UUID                   NOT NULL,
  "invitedOtaId"   UUID                   NOT NULL,
  "invitedByOtaId" UUID,
  "status"         "GroupInvitationStatus" NOT NULL DEFAULT 'pending',
  "createdAt"      TIMESTAMP(3)           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3)           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_invitation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "group_invitation_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "ota_group"("id") ON DELETE CASCADE,
  CONSTRAINT "group_invitation_invitedOtaId_fkey"
    FOREIGN KEY ("invitedOtaId") REFERENCES "ota_profile"("userId") ON DELETE CASCADE,
  CONSTRAINT "group_invitation_invitedByOtaId_fkey"
    FOREIGN KEY ("invitedByOtaId") REFERENCES "ota_profile"("userId") ON DELETE SET NULL
);

-- group_student_proposal  (child of ota_group, mahasiswa_profile, ota_profile)
CREATE TABLE IF NOT EXISTS "group_student_proposal" (
  "id"          UUID            NOT NULL DEFAULT gen_random_uuid(),
  "groupId"     UUID            NOT NULL,
  "mahasiswaId" UUID            NOT NULL,
  "proposedById" UUID,
  "status"      "ProposalStatus" NOT NULL DEFAULT 'open',
  "createdAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_student_proposal_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "group_student_proposal_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "ota_group"("id") ON DELETE CASCADE,
  CONSTRAINT "group_student_proposal_mahasiswaId_fkey"
    FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa_profile"("userId") ON DELETE CASCADE,
  CONSTRAINT "group_student_proposal_proposedById_fkey"
    FOREIGN KEY ("proposedById") REFERENCES "ota_profile"("userId") ON DELETE SET NULL
);

-- group_student_proposal_vote  (child of group_student_proposal, ota_profile)
CREATE TABLE IF NOT EXISTS "group_student_proposal_vote" (
  "proposalId"   UUID         NOT NULL,
  "otaId"        UUID         NOT NULL,
  "approve"      BOOLEAN      NOT NULL,
  "pledgeAmount" INTEGER      NOT NULL,
  "votedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_student_proposal_vote_pkey" PRIMARY KEY ("proposalId","otaId"),
  CONSTRAINT "group_student_proposal_vote_proposalId_fkey"
    FOREIGN KEY ("proposalId") REFERENCES "group_student_proposal"("id") ON DELETE CASCADE,
  CONSTRAINT "group_student_proposal_vote_otaId_fkey"
    FOREIGN KEY ("otaId") REFERENCES "ota_profile"("userId") ON DELETE CASCADE
);

-- group_connection  (child of mahasiswa_profile, ota_group, group_student_proposal)
CREATE TABLE IF NOT EXISTS "group_connection" (
  "id"                         UUID               NOT NULL DEFAULT gen_random_uuid(),
  "mahasiswaId"                UUID               NOT NULL,
  "groupId"                    UUID               NOT NULL,
  "proposalId"                 UUID,
  "connectionStatus"           "ConnectionStatus" NOT NULL DEFAULT 'pending',
  "requestTerminateGroup"      BOOLEAN            NOT NULL DEFAULT false,
  "requestTerminateMahasiswa"  BOOLEAN            NOT NULL DEFAULT false,
  "requestTerminationNoteGroup" TEXT,
  "requestTerminationNoteMa"   TEXT,
  "paidFor"                    INTEGER            NOT NULL DEFAULT 0,
  "startDate"                  TIMESTAMP(3),
  "endDate"                    TIMESTAMP(3),
  "periodStatus"               "PeriodStatus"     NOT NULL DEFAULT 'active',
  "createdAt"                  TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"                  TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_connection_pkey"               PRIMARY KEY ("id"),
  CONSTRAINT "group_connection_proposalId_key"     UNIQUE ("proposalId"),
  CONSTRAINT "group_connection_mahasiswaId_groupId_key" UNIQUE ("mahasiswaId","groupId"),
  CONSTRAINT "group_connection_mahasiswaId_fkey"
    FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa_profile"("userId") ON DELETE CASCADE,
  CONSTRAINT "group_connection_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "ota_group"("id") ON DELETE CASCADE,
  CONSTRAINT "group_connection_proposalId_fkey"
    FOREIGN KEY ("proposalId") REFERENCES "group_student_proposal"("id") ON DELETE SET NULL
);

-- group_member_contribution  (child of group_connection, ota_profile)
CREATE TABLE IF NOT EXISTS "group_member_contribution" (
  "groupConnectionId" UUID    NOT NULL,
  "otaId"             UUID    NOT NULL,
  "amount"            INTEGER NOT NULL,
  CONSTRAINT "group_member_contribution_pkey" PRIMARY KEY ("groupConnectionId","otaId"),
  CONSTRAINT "group_member_contribution_groupConnectionId_fkey"
    FOREIGN KEY ("groupConnectionId") REFERENCES "group_connection"("id") ON DELETE CASCADE,
  CONSTRAINT "group_member_contribution_otaId_fkey"
    FOREIGN KEY ("otaId") REFERENCES "ota_profile"("userId") ON DELETE CASCADE
);

-- group_transaction  (child of mahasiswa_profile, ota_group, group_connection)
CREATE TABLE IF NOT EXISTS "group_transaction" (
  "id"               UUID                NOT NULL DEFAULT gen_random_uuid(),
  "mahasiswaId"      UUID                NOT NULL,
  "groupId"          UUID                NOT NULL,
  "groupConnectionId" UUID               NOT NULL,
  "bill"             INTEGER             NOT NULL,
  "paidFor"          INTEGER             NOT NULL DEFAULT 0,
  "dueDate"          TIMESTAMP(3)        NOT NULL,
  "transactionStatus" "TransactionStatus" NOT NULL DEFAULT 'unpaid',
  "transferStatus"   "TransferStatus"    NOT NULL DEFAULT 'unpaid',
  "createdAt"        TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_transaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "group_transaction_mahasiswaId_fkey"
    FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa_profile"("userId") ON DELETE CASCADE,
  CONSTRAINT "group_transaction_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "ota_group"("id") ON DELETE CASCADE,
  CONSTRAINT "group_transaction_groupConnectionId_fkey"
    FOREIGN KEY ("groupConnectionId") REFERENCES "group_connection"("id") ON DELETE CASCADE
);

-- group_member_transaction  (child of group_transaction, ota_profile)
CREATE TABLE IF NOT EXISTS "group_member_transaction" (
  "id"                 UUID                NOT NULL DEFAULT gen_random_uuid(),
  "groupTransactionId" UUID                NOT NULL,
  "otaId"              UUID                NOT NULL,
  "expectedAmount"     INTEGER             NOT NULL,
  "amountPaid"         INTEGER             NOT NULL DEFAULT 0,
  "transactionReceipt" TEXT,
  "paymentStatus"      "TransactionStatus" NOT NULL DEFAULT 'unpaid',
  "transferStatus"     "TransferStatus"    NOT NULL DEFAULT 'unpaid',
  "rejectionNote"      TEXT,
  "paidAt"             TIMESTAMP(3),
  "createdAt"          TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "group_member_transaction_pkey"                    PRIMARY KEY ("id"),
  CONSTRAINT "group_member_transaction_groupTransactionId_otaId_key" UNIQUE ("groupTransactionId","otaId"),
  CONSTRAINT "group_member_transaction_groupTransactionId_fkey"
    FOREIGN KEY ("groupTransactionId") REFERENCES "group_transaction"("id") ON DELETE CASCADE,
  CONSTRAINT "group_member_transaction_otaId_fkey"
    FOREIGN KEY ("otaId") REFERENCES "ota_profile"("userId") ON DELETE CASCADE
);
