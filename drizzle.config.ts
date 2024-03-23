import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "database/schema.ts",
  out: "database/out/",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});
