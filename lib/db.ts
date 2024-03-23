import { Resource } from "sst";
import { drizzle } from "drizzle-orm/aws-data-api/pg";
import { RDSDataClient } from "@aws-sdk/client-rds-data";
import { schema } from "@/database/schema";

export const db = drizzle(new RDSDataClient({}), {
  database: Resource.AnitrackDatabase.database,
  secretArn: Resource.AnitrackDatabase.secretArn,
  resourceArn: Resource.AnitrackDatabase.clusterArn,
  schema: schema,
});
