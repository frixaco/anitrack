import { db } from "@/lib/db";
import { migrate as mig } from "drizzle-orm/aws-data-api/pg/migrator";

export async function migrate(migrationsPath: string) {
  return mig(db, { migrationsFolder: migrationsPath });
}

(async () => {
  await migrate("database/migrations");
})();
