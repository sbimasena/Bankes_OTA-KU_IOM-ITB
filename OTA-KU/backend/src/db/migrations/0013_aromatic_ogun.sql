CREATE TYPE "public"."fakultas" AS ENUM('FMIPA', 'SITH-S', 'SF', 'FITB', 'FTTM', 'STEI-R', 'FTSL', 'FTI', 'FSRD', 'FTMD', 'STEI-K', 'SBM', 'SITH-R', 'SAPPK');--> statement-breakpoint
CREATE TYPE "public"."jurusan" AS ENUM('Matematika', 'Fisika', 'Astronomi', 'Mikrobiologi', 'Kimia', 'Biologi', 'Sains dan Teknologi Farmasi', 'Aktuaria', 'Teknik Oseanografi', 'Rekayasa Hayati', 'Rekayasa Pertanian', 'Rekayasa Kehutanan', 'Farmasi Klinik dan Komunitas', 'Teknologi Pasca Panen', 'Teknik Geologi', 'Teknik Pertambangan', 'Teknik Perminyakan', 'Teknik Geofisika', 'Teknik Metalurgi', 'Meteorologi', 'Oseanografi', 'Teknik Kimia', 'Teknik Mesin', 'Teknik Elektro', 'Teknik Fisika', 'Teknik Industri', 'Teknik Informatika', 'Aeronotika dan Astronotika', 'Teknik Material', 'Teknik Pangan', 'Manajemen Rekayasa Industri', 'Teknik Bioenergi dan Kemurgi', 'Teknik Sipil', 'Teknik Geodesi dan Geomatika', 'Arsitektur', 'Teknik Lingkungan', 'Perencanaan Wilayah dan Kota', 'Teknik Kelautan', 'Rekayasa Infrastruktur Lingkungan', 'Teknik dan Pengelolaan Sumber Daya Air', 'Seni Rupa', 'Desain', 'Kriya', 'Desain Interior', 'Desain Komunikasi Visual', 'Desain Produk', 'Teknik Tenaga Listrik', 'Teknik Telekomunikasi', 'Sistem Teknologi dan Informasi', 'Teknik Biomedis', 'Manajemen', 'Kewirausahaan', 'TPB');--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "major" "jurusan";--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "faculty" "fakultas";--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "cityOfOrigin" varchar(255);--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "highschoolAlumni" varchar(255);--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "kk" text;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "ktm" text;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "wali_recommendation_letter" text;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "transcript" text;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "salary_report" text;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "pbb" text;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "electricity_bill" text;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "ditmawa_recommendation_letter" text;--> statement-breakpoint
ALTER TABLE "account_mahasiswa_detail" ADD COLUMN "notes" text;