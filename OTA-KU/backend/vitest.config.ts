import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: "./tests/setup.ts",
    fileParallelism: false,
    restoreMocks: true,
    coverage: {
      exclude: ["./src/db/seed.ts", "./src/db/reset.ts", "./vitest.config.ts"],
    },
  },
});
