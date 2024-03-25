import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "database/schema.ts",
  out: "database/migrations",
  driver: "pg",
});
