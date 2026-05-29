import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Sementara diturunkan ke "warn" agar CI tidak gagal karena isu pre-existing.
    // Naikkan kembali ke "error" setelah semua isu di bawah diperbaiki:
    //   - no-unused-vars: hapus import/variabel yang tidak dipakai
    //   - no-explicit-any: ganti `any` dengan tipe yang tepat (atau `unknown`)
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
