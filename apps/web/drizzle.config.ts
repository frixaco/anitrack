import { env } from "@/env";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  tablesFilter: ["anitrack_*"],
} satisfies Config;
