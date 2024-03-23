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
    });
  },
});
