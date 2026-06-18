import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    environmentMatchGlobs: [["src/app/api/**", "node"]],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
