import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    fileParallelism: false,
    globalSetup: ["./test/globalSetup.ts"],
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/server.ts",
        "src/types/**",
      ],
    },
    env: {
      NODE_ENV: "test",
      PGHOST: "localhost",
      PGPORT: "5433",
      PGUSER: "researchconnect",
      PGPASSWORD: "testpassword",
      PGDATABASE: "researchconnect_test",
      SESSION_SECRET: "test-session-secret",
      GOOGLE_CLIENT_ID: "test-google-client",
      GOOGLE_CLIENT_SECRET: "test-google-secret",
      GOOGLE_CALLBACK_URL:
        "http://localhost:4100/auth/google/callback",
    },
  },
});