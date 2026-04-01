import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("account_type", [
  "mahasiswa",
  "ota",
  "admin",
  "bankes",
  "pengurus"
]);

export const linkageEnum = pgEnum("linkage", [
  "otm",
  "dosen",
  "alumni",
  "lainnya",
  "none",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "verified",
  "unverified",
]);

export const applicationStatusEnum = pgEnum("account_status", [
  "accepted",
  "rejected",
  "pending",
  "unregistered",
  "reapply",
  "outdated",
]);

export const mahasiswaStatusEnum = pgEnum("mahasiswa_status", [
  "active",
  "inactive",
]);

export const providerEnum = pgEnum("provider", ["credentials", "azure"]);

export const jurusanEnum = pgEnum("jurusan", [
  "Matematika",
  "Fisika",
  "Astronomi",
  "Mikrobiologi",
  "Kimia",
  "Biologi",
  "Sains dan Teknologi Farmasi",
  "Aktuaria",
  "Rekayasa Hayati",
  "Rekayasa Pertanian",
  "Rekayasa Kehutanan",
  "Farmasi Klinik dan Komunitas",
  "Teknologi Pasca Panen",
  "Teknik Geologi",
  "Teknik Pertambangan",
  "Teknik Perminyakan",
  "Teknik Geofisika",
  "Teknik Metalurgi",
  "Meteorologi",
  "Oseanografi",
  "Teknik Kimia",
  "Teknik Mesin",
  "Teknik Elektro",
  "Teknik Fisika",
  "Teknik Industri",
  "Teknik Informatika",
  "Aeronotika dan Astronotika",
  "Teknik Material",
  "Teknik Pangan",
  "Manajemen Rekayasa Industri",
  "Teknik Bioenergi dan Kemurgi",
  "Teknik Sipil",
  "Teknik Geodesi dan Geomatika",
  "Arsitektur",
  "Teknik Lingkungan",
  "Perencanaan Wilayah dan Kota",
  "Teknik Kelautan",
  "Rekayasa Infrastruktur Lingkungan",
  "Teknik dan Pengelolaan Sumber Daya Air",
  "Seni Rupa",
  "Desain",
  "Kriya",
  "Desain Interior",
  "Desain Komunikasi Visual",
  "Desain Produk",
  "Teknik Tenaga Listrik",
  "Teknik Telekomunikasi",
  "Sistem Teknologi dan Informasi",
  "Teknik Biomedis",
  "Manajemen",
  "Kewirausahaan",
  "TPB",
]);

export const fakultasEnum = pgEnum("fakultas", [
  "FMIPA",
  "SITH-S",
  "SF",
  "FITB",
  "FTTM",
  "STEI-R",
  "FTSL",
  "FTI",
  "FSRD",
  "FTMD",
  "STEI-K",
  "SBM",
  "SITH-R",
  "SAPPK",
]);

export const religionEnum = pgEnum("religion", [
  "Islam",
  "Kristen Protestan",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
]);

export const genderEnum = pgEnum("gender", ["M", "F"]);

export const connectionStatusEnum = pgEnum("connection_status", [
  "accepted",
  "rejected",
  "pending",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "paid",
  "unpaid",
]);

export const transferStatus = pgEnum("transfer_status", ["paid", "unpaid"]);

export const accountTable = pgTable("account", {
  id: uuid("id").defaultRandom().primaryKey().unique().notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  phoneNumber: varchar({ length: 32 }).unique(),
  password: varchar({ length: 255 }).notNull(),
  type: accountTypeEnum("type").notNull(),
  provider: providerEnum("provider").notNull().default("credentials"),
  status: verificationStatusEnum("status").notNull().default("unverified"),
  applicationStatus: applicationStatusEnum("application_status")
    .notNull()
    .default("unregistered"),
  oid: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accountMahasiswaDetailTable = pgTable("account_mahasiswa_detail", {
  accountId: uuid("account_id")
    .primaryKey()
    .notNull()
    .references(() => accountTable.id, {
      onDelete: "cascade",
    }),
  name: varchar({ length: 255 }),
  nim: varchar({ length: 8 }).unique().notNull(),
  major: jurusanEnum("major"),
  faculty: fakultasEnum("faculty"),
  cityOfOrigin: varchar({ length: 255 }),
  highschoolAlumni: varchar({ length: 255 }),
  religion: religionEnum("religion"),
  gender: genderEnum("gender"),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  description: text("description"),
  file: text("file"),
  kk: text("kk"),
  ktm: text("ktm"),
  waliRecommendationLetter: text("wali_recommendation_letter"),
  transcript: text("transcript"),
  salaryReport: text("salary_report"),
  pbb: text("pbb"),
  electricityBill: text("electricity_bill"),
  ditmawaRecommendationLetter: text("ditmawa_recommendation_letter"),
  bill: integer("bill").notNull().default(0),
  notes: text("notes"),
  adminOnlyNotes: text("admin_only_notes"),
  mahasiswaStatus: mahasiswaStatusEnum("mahasiswa_status")
    .notNull()
    .default("inactive"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  dueNextUpdateAt: timestamp("due_next_update_at").defaultNow().notNull(),
});

export const accountOtaDetailTable = pgTable("account_ota_detail", {
  accountId: uuid("account_id")
    .primaryKey()
    .notNull()
    .references(() => accountTable.id, {
      onDelete: "cascade",
    }),
  name: varchar({ length: 255 }).notNull(),
  job: varchar({ length: 255 }).notNull(),
  address: varchar({ length: 255 }).notNull(),
  linkage: linkageEnum("linkage").notNull(),
  funds: integer("funds").notNull(),
  maxCapacity: integer("max_capacity").notNull(),
  startDate: timestamp("start_date").notNull(),
  maxSemester: integer("max_semester").notNull(),
  transferDate: integer("transfer_date").notNull(),
  criteria: text("criteria").notNull(),
  isDetailVisible: boolean("is_detail_visible").default(false).notNull(),
  allowAdminSelection: boolean("allow_admin_selection")
    .default(false)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accountAdminDetailTable = pgTable("account_admin_detail", {
  accountId: uuid("account_id")
    .primaryKey()
    .notNull()
    .references(() => accountTable.id, {
      onDelete: "cascade",
    }),
  name: varchar({ length: 255 }).notNull(),
});

export const connectionTable = pgTable(
  "connection",
  {
    mahasiswaId: uuid("mahasiswa_id")
      .notNull()
      .references(() => accountMahasiswaDetailTable.accountId, {
        onDelete: "cascade",
      }),
    otaId: uuid("ota_id")
      .notNull()
      .references(() => accountOtaDetailTable.accountId, {
        onDelete: "cascade",
      }),
    connectionStatus: connectionStatusEnum("connection_status")
      .notNull()
      .default("pending"),
    requestTerminateOta: boolean("request_terminate_ota")
      .default(false)
      .notNull(),
    requestTerminateMahasiswa: boolean("request_terminate_mahasiswa")
      .default(false)
      .notNull(),
    requestTerminationNoteOTA: text("request_termination_note_ota"),
    requestTerminationNoteMA: text("request_termination_note_ma"),
    paidFor: integer("paid_for").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.mahasiswaId, table.otaId] })],
);

export const transactionTable = pgTable("transaction", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  mahasiswaId: uuid("mahasiswa_id")
    .notNull()
    .references(() => accountMahasiswaDetailTable.accountId, {
      onDelete: "cascade",
    }),
  otaId: uuid("ota_id")
    .notNull()
    .references(() => accountOtaDetailTable.accountId, {
      onDelete: "cascade",
    }),
  bill: integer("bill").notNull(),
  amountPaid: integer("amount_paid").notNull().default(0),
  paidAt: timestamp("paid_at"),
  dueDate: timestamp("due_date").notNull(),
  transactionStatus: transactionStatusEnum("transaction_status")
    .notNull()
    .default("unpaid"),
  transferStatus: transferStatus("transfer_status").notNull().default("unpaid"),
  transactionReceipt: text("transaction_receipt"),
  paidFor: integer("paid_for").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  rejectionNote: text("verif_note"),
});

export const otpTable = pgTable(
  "otp",
  {
    accountId: uuid("account_id")
      .notNull()
      .references(() => accountTable.id, {
        onDelete: "cascade",
      }),
    code: varchar({ length: 6 }).notNull(),
    expiredAt: timestamp("expired_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.accountId, table.code] })],
);

export const temporaryPasswordTable = pgTable(
  "temporary_password",
  {
    accountId: uuid("account_id")
      .notNull()
      .references(() => accountTable.id, {
        onDelete: "cascade",
      }),
    password: varchar({ length: 255 }).notNull(),
    expiredAt: timestamp("expired_at").notNull(),
    used: boolean("used").default(false).notNull(),
  },
  (table) => [primaryKey({ columns: [table.accountId, table.password] })],
);

export const pushSubscriptionTable = pgTable(
  "push_subscription",
  {
    accountId: uuid("account_id")
      .notNull()
      .references(() => accountTable.id, {
        onDelete: "cascade",
      }),
    endpoint: text("endpoint").notNull(),
    keys: json("keys").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.accountId, table.endpoint] })],
);

export const accountRelations = relations(accountTable, ({ one, many }) => ({
  accountMahasiswaDetail: one(accountMahasiswaDetailTable, {
    fields: [accountTable.id],
    references: [accountMahasiswaDetailTable.accountId],
  }),
  accountOtaDetail: one(accountOtaDetailTable, {
    fields: [accountTable.id],
    references: [accountOtaDetailTable.accountId],
  }),
  accountAdminDetail: one(accountAdminDetailTable, {
    fields: [accountTable.id],
    references: [accountAdminDetailTable.accountId],
  }),
  otps: many(otpTable),
  temporaryPasswords: many(temporaryPasswordTable),
  pushSubscriptions: many(pushSubscriptionTable),
}));

export const accountMahasiswaDetailRelations = relations(
  accountMahasiswaDetailTable,
  ({ one, many }) => ({
    account: one(accountTable, {
      fields: [accountMahasiswaDetailTable.accountId],
      references: [accountTable.id],
    }),
    connection: many(connectionTable),
    transaction: many(transactionTable),
  }),
);

export const accountOtaDetailRelations = relations(
  accountOtaDetailTable,
  ({ one, many }) => ({
    account: one(accountTable, {
      fields: [accountOtaDetailTable.accountId],
      references: [accountTable.id],
    }),
    connection: many(connectionTable),
    transaction: many(transactionTable),
  }),
);

export const accountAdminDetailRelations = relations(
  accountAdminDetailTable,
  ({ one }) => ({
    account: one(accountTable, {
      fields: [accountAdminDetailTable.accountId],
      references: [accountTable.id],
    }),
  }),
);

export const connectionRelations = relations(connectionTable, ({ one }) => ({
  mahasiswa: one(accountMahasiswaDetailTable, {
    fields: [connectionTable.mahasiswaId],
    references: [accountMahasiswaDetailTable.accountId],
  }),
  ota: one(accountOtaDetailTable, {
    fields: [connectionTable.otaId],
    references: [accountOtaDetailTable.accountId],
  }),
}));

export const transactionRelations = relations(transactionTable, ({ one }) => ({
  mahasiswa: one(accountMahasiswaDetailTable, {
    fields: [transactionTable.mahasiswaId],
    references: [accountMahasiswaDetailTable.accountId],
  }),
  ota: one(accountOtaDetailTable, {
    fields: [transactionTable.otaId],
    references: [accountOtaDetailTable.accountId],
  }),
}));

export const otpRelations = relations(otpTable, ({ one }) => ({
  account: one(accountTable, {
    fields: [otpTable.accountId],
    references: [accountTable.id],
  }),
}));

export const temporaryPasswordRelations = relations(
  temporaryPasswordTable,
  ({ one }) => ({
    account: one(accountTable, {
      fields: [temporaryPasswordTable.accountId],
      references: [accountTable.id],
    }),
  }),
);

export const pushSubscriptionRelations = relations(
  pushSubscriptionTable,
  ({ one }) => ({
    account: one(accountTable, {
      fields: [pushSubscriptionTable.accountId],
      references: [accountTable.id],
    }),
  }),
);
