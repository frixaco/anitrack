/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "anitrack",
      removal: input?.stage === "production" ? "remove" : "remove",
      home: "aws",
    };
  },
  async run() {
    const database = new sst.aws.Postgres("AnitrackDatabase");
    new sst.aws.Nextjs("AnitrackNextjsApp", {
      link: [database],
      environment: {
        AUTH_SECRET: process.env.AUTH_SECRET!,
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID!,
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET!,
      },
    });
    const migrator = new sst.aws.Function("AnitrackDatabaseMigrator", {
      link: [database],
      handler: "migrator/lambda.handler",
      timeout: "20 seconds",
      copyFiles: [
        {
          from: "database/migrations",
          to: "migrations",
        },
      ],
      url: {
        authorization: "none",
        cors: {
          allowMethods: ["POST", "GET"],
          allowOrigins: ["*"],
        },
      },
      runtime: "nodejs20.x",
    });

    migrator.url.apply(async (v) => {
      console.log("Migrator function URL: ", v);
    });
  },
});
