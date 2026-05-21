import { NextAuthOptions, Account, Profile } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
// import AzureADProvider from "next-auth/providers/azure-ad";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { prisma } from '@/lib/prisma';

const mappingFakultasProdi : { [key: string]: { fakultas: string; prodi: string } } = {
  "101": { fakultas: "Fakultas Matematika dan Ilmu Pengetahuan Alam", prodi: "Matematika" },
  "102": { fakultas: "Fakultas Matematika dan Ilmu Pengetahuan Alam", prodi: "Fisika" },
  "103": { fakultas: "Fakultas Matematika dan Ilmu Pengetahuan Alam", prodi: "Astronomi" },
  "105": { fakultas: "Fakultas Matematika dan Ilmu Pengetahuan Alam", prodi: "Kimia" },
  "108": { fakultas: "Fakultas Matematika dan Ilmu Pengetahuan Alam", prodi: "Aktuaria" },
  "160": { fakultas: "Fakultas Matematika dan Ilmu Pengetahuan Alam", prodi: "TPB FMIPA" },

  "104": { fakultas: "Sekolah Ilmu dan Teknologi Hayati", prodi: "Mikrobiologi" },
  "106": { fakultas: "Sekolah Ilmu dan Teknologi Hayati", prodi: "Biologi" },
  "112": { fakultas: "Sekolah Ilmu dan Teknologi Hayati", prodi: "Rekayasa Hayati" },
  "114": { fakultas: "Sekolah Ilmu dan Teknologi Hayati", prodi: "Rekayasa Pertanian" },
  "115": { fakultas: "Sekolah Ilmu dan Teknologi Hayati", prodi: "Rekayasa Kehutanan" },
  "119": { fakultas: "Sekolah Ilmu dan Teknologi Hayati", prodi: "Teknologi Pasca Panen" },
  "161": { fakultas: "Sekolah Ilmu dan Teknologi Hayati", prodi: "TPB SITH-S" },
  "198": { fakultas: "Sekolah Ilmu dan Teknologi Hayati", prodi: "TPB SITH-R" },

  "107": { fakultas: "Sekolah Farmasi", prodi: "Sains dan Teknologi Farmasi" },
  "116": { fakultas: "Sekolah Farmasi", prodi: "Farmasi Klinik dan Komunitas" },
  "162": { fakultas: "Sekolah Farmasi", prodi: "TPB SF" },

  "121": { fakultas: "Fakultas Teknik Pertambangan dan Perminyakan", prodi: "Teknik Pertambangan" },
  "122": { fakultas: "Fakultas Teknik Pertambangan dan Perminyakan", prodi: "Teknik Perminyakan" },
  "123": { fakultas: "Fakultas Teknik Pertambangan dan Perminyakan", prodi: "Teknik Geofisika" },
  "125": { fakultas: "Fakultas Teknik Pertambangan dan Perminyakan", prodi: "Teknik Metalurgi" },
  "164": { fakultas: "Fakultas Teknik Pertambangan dan Perminyakan", prodi: "TPB FTTM" },

  "120": { fakultas: "Fakultas Ilmu dan Teknologi Kebumian", prodi: "Teknik Geologi" },
  "128": { fakultas: "Fakultas Ilmu dan Teknologi Kebumian", prodi: "Meteorologi" },
  "129": { fakultas: "Fakultas Ilmu dan Teknologi Kebumian", prodi: "Oseanografi" },
  "151": { fakultas: "Fakultas Ilmu dan Teknologi Kebumian", prodi: "Teknik Geodesi dan Geomatika" },
  "163": { fakultas: "Fakultas Ilmu dan Teknologi Kebumian", prodi: "TPB FITB" },

  "130": { fakultas: "Fakultas Teknologi Industri", prodi: "Teknik Kimia" },
  "133": { fakultas: "Fakultas Teknologi Industri", prodi: "Teknik Fisika" },
  "134": { fakultas: "Fakultas Teknologi Industri", prodi: "Teknik Industri" },
  "143": { fakultas: "Fakultas Teknologi Industri", prodi: "Teknik Pangan" },
  "144": { fakultas: "Fakultas Teknologi Industri", prodi: "Manajemen Rekayasa" },
  "145": { fakultas: "Fakultas Teknologi Industri", prodi: "Teknik Bioenergi dan Kemurgi" },
  "167": { fakultas: "Fakultas Teknologi Industri", prodi: "TPB FTI" },

  "132": { fakultas: "Sekolah Teknik Elektro dan Informatika", prodi: "Teknik Elektro" },
  "135": { fakultas: "Sekolah Teknik Elektro dan Informatika", prodi: "Teknik Informatika" },
  "165": { fakultas: "Sekolah Teknik Elektro dan Informatika", prodi: "TPB STEI-R" },
  "180": { fakultas: "Sekolah Teknik Elektro dan Informatika", prodi: "Teknik Tenaga Listrik" },
  "181": { fakultas: "Sekolah Teknik Elektro dan Informatika", prodi: "Teknik Telekomunikasi" },
  "182": { fakultas: "Sekolah Teknik Elektro dan Informatika", prodi: "Sistem dan Teknologi Informasi" },
  "183": { fakultas: "Sekolah Teknik Elektro dan Informatika", prodi: "Teknik Biomedis" },
  "196": { fakultas: "Sekolah Teknik Elektro dan Informatika", prodi: "TPB STEI-K" },

  "131": { fakultas: "Fakultas Teknik Mesin dan Dirgantara", prodi: "Teknik Mesin" },
  "136": { fakultas: "Fakultas Teknik Mesin dan Dirgantara", prodi: "Teknik Dirgantara" },
  "137": { fakultas: "Fakultas Teknik Mesin dan Dirgantara", prodi: "Teknik Material" },
  "169": { fakultas: "Fakultas Teknik Mesin dan Dirgantara", prodi: "TPB FTMD" },

  "150": { fakultas: "Fakultas Teknik Sipil dan Lingkungan", prodi: "Teknik Sipil" },
  "153": { fakultas: "Fakultas Teknik Sipil dan Lingkungan", prodi: "Teknik Lingkungan" },
  "155": { fakultas: "Fakultas Teknik Sipil dan Lingkungan", prodi: "Teknik Kelautan" },
  "157": { fakultas: "Fakultas Teknik Sipil dan Lingkungan", prodi: "Rekayasa Infrastruktur Lingkungan" },
  "158": { fakultas: "Fakultas Teknik Sipil dan Lingkungan", prodi: "Teknik dan Pengelolaan Sumber Daya Air" },
  "166": { fakultas: "Fakultas Teknik Sipil dan Lingkungan", prodi: "TPB FTSL" },

  "152": { fakultas: "Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan", prodi: "Arsitektur" },
  "154": { fakultas: "Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan", prodi: "Perencanaan Wilayah dan Kota" },
  "156": { fakultas: "Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan", prodi: "Perencanaan Wilayah dan Kota (Kampus Cirebon)" },
  "199": { fakultas: "Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan", prodi: "TPB SAPPK" },

  "168": { fakultas: "Fakultas Seni Rupa dan Desain", prodi: "TPB FSRD" },
  "170": { fakultas: "Fakultas Seni Rupa dan Desain", prodi: "Seni Rupa" },
  "171": { fakultas: "Fakultas Seni Rupa dan Desain", prodi: "Kriya (Kampus Cirebon)" },
  "172": { fakultas: "Fakultas Seni Rupa dan Desain", prodi: "Kriya" },
  "173": { fakultas: "Fakultas Seni Rupa dan Desain", prodi: "Desain Interior" },
  "174": { fakultas: "Fakultas Seni Rupa dan Desain", prodi: "Desain Komunikasi Visual" },
  "175": { fakultas: "Fakultas Seni Rupa dan Desain", prodi: "Desain Produk" },

  "190": { fakultas: "Sekolah Bisnis dan Manajemen", prodi: "Manajemen" },
  "192": { fakultas: "Sekolah Bisnis dan Manajemen", prodi: "Kewirausahaan" },
  "197": { fakultas: "Sekolah Bisnis dan Manajemen", prodi: "TPB SBM" },
};

function getFakultasProdi(email: string) {
  const prefix = email.substring(0, 3);
  const mapping = mappingFakultasProdi[prefix];
  return mapping || { fakultas: "Unknown Faculty", prodi: "Unknown Program" };
}

/**
 * Memetakan role Keycloak ke role lokal Bankes
 * Role di Keycloak: admin, mahasiswa, volunteer-pewawancara, orang-tua-asuh, pengurus-bidang-1, pengurus-bidang-2, sekretariat, bendahara
 */
function keycloakRoleToLocal(roles: string[]): string {
  if (roles.includes("admin"))                  return "Admin";
  if (roles.includes("mahasiswa"))              return "Mahasiswa";
  if (roles.includes("volunteer-pewawancara"))  return "Pewawancara";
  if (roles.includes("orang-tua-asuh"))         return "OrangTuaAsuh";
  if (roles.includes("pengurus-bidang-1"))      return "Pengurus_IOM";
  if (roles.includes("pengurus-bidang-2"))      return "Pengurus_IOM";
  // "sekretariat" dan "bendahara" tidak ada mapping ke Bankes — treat as Guest
  return "Guest";
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // `account` dan `profile` hanya ada pada first sign-in
      if (account && profile) {
        const ssoId = account.providerAccountId; // Keycloak `sub` UUID
        token.idToken = account.id_token;

        // Ekstrak roles dari Keycloak access token
        // Access token berisi realm_access.roles
        let roles: string[] = [];
        if (account.access_token) {
          try {
            const [, payload] = account.access_token.split(".");
            const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
            roles = decoded?.realm_access?.roles ?? [];
          } catch {
            roles = [];
          }
        }

        const localRole = keycloakRoleToLocal(roles);

        // Upsert local user — single query: match by ssoId OR email
        let user = await prisma.user.findFirst({
          where: { OR: [{ oid: ssoId }, { email: profile.email }] },
        });

        const keycloakName = (profile as Record<string, unknown>).name as string | undefined;

        if (!user) {
          // Genuinely new user
          user = await prisma.user.create({
            data: {
              oid: ssoId,
              email: profile.email ?? "",
              name: keycloakName ?? null,
              role: localRole as any,
              provider: "keycloak" as any,
              verificationStatus: "verified" as any,
            },
          });
        } else if (!user.oid) {
          // Existing user migrating from non-SSO — attach ssoId
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              oid: ssoId,
              provider: "keycloak" as any,
              role: localRole as any,
              // Only set name from Keycloak if DB has none yet
              ...(user.name ? {} : { name: keycloakName ?? null }),
            },
          });
        }
        // If user already has ssoId, use DB role as source of truth (managed by admin)

        token.id    = user.id;
        token.role  = user.role;
        token.ssoId = ssoId;
        token.email = profile.email;
        // DB name (updated via profile form) takes priority; fall back to Keycloak name
        token.name  = user.name ?? keycloakName ?? null;
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id    = token.id as string;
        session.user.role  = token.role as string;
        session.user.email = token.email as string;
        session.user.name  = (token.name as string | null) ?? undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};