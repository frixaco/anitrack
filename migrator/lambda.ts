import { readdir } from "fs/promises";
import { migrate as mig } from "drizzle-orm/aws-data-api/pg/migrator";
import { db } from "../lib/db";

const migrate = (migrationsPath: string) => {
  return mig(db, { migrationsFolder: migrationsPath });
};

const handler = async () => {
  console.log("Migrating...");

  console.log("Current dir contents:", __dirname);
  let dirs = await readdir(__dirname);
  console.log({ dirs });

  for (const dir of dirs) {
    try {
      console.log(dir, await readdir(dir));
    } catch (e) {}
  }

  console.log("Level above dir contents:");
  dirs = await readdir("../");
  console.log({ dirs });

  for (const dir of dirs) {
    try {
      console.log(dir, await readdir(dir));
    } catch (e) {}
  }

  await migrate("migrations");

  return {
    body: "Migrations completed",
  };
};

export { handler };
