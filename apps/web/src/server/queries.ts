"use server";

import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { release, watchHistory } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { env } from "@/env";

// export async function getCurrentUser() {
//   const authorizedUser = auth();
//   if (!authorizedUser.userId) throw new Error("Unauthorized");
//
//   analyticsServerClient.capture({
//     distinctId: authorizedUser.userId,
//     event: "get current user",
//     properties: {
//       metadata: "metadata",
//     },
//   });
//
//   const { success } = await ratelimit.limit(authorizedUser.userId);
//
//   if (!success) {
//     throw new Error("Rate limit reached");
//   }
//
//   // TODO:
//   // 1. Register new user
//   // 2. Add private metada to the user (e.g. allow something)
//   const fullUserData = await clerkClient.users.getUser(authorizedUser.userId);
//   if (fullUserData.privateMetadata?.["can-do-something"] !== true) {
//     throw new Error("User can't do something");
//   }
//
//   const user = await db.query.user.findFirst({
//     where: ({ uuid }, { eq }) => eq(uuid, authorizedUser.userId),
//   });
//
//   return user;
// }

const schema = z.object({
  nyaaUrl: z
    .string({
      invalid_type_error: "Invalid URL",
    })
    .url(),
  aniwaveUrl: z
    .string({
      invalid_type_error: "Invalid URL",
    })
    .url(),
  userId: z.string({
    invalid_type_error: "Invalid user ID",
  }),
});

export async function addRelease(_: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    nyaaUrl: formData.get("nyaaUrl"),
    aniwaveUrl: formData.get("aniwaveUrl"),
    userId: formData.get("userId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { nyaaUrl, aniwaveUrl, userId } = validatedFields.data;

  await new Promise((r) => setTimeout(() => r("DONE"), 2000));
  // const response = await fetch(`${env.API_URL!}/scrape`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     nyaaUrl,
  //     aniwaveUrl,
  //     userId,
  //   }),
  // });
  //
  // console.log("Response: ", await response.json());

  revalidatePath("/", "page");
  return { errors: {}, success: true };
}

export async function markEpisodeWatched(
  {
    lastWatchedEpisode,
    releaseId,
    nyaaUrl,
    aniwaveUrl,
    seasonNumber,
  }: {
    lastWatchedEpisode: number;
    releaseId: string;
    nyaaUrl: string;
    aniwaveUrl: string;
    seasonNumber: number;
  },
  _formData: FormData,
) {
  const user = auth();
  if (!user.userId) {
    throw new Error("User is not authorized");
  }

  try {
    await db
      .update(release)
      .set({
        lastWatchedEpisode,
      })
      .where(
        and(eq(release.userId, user.userId), eq(release.isTracking, true)),
      );

    await db.insert(watchHistory).values({
      uuid: randomUUID(),
      episode: lastWatchedEpisode,
      nyaaEpisodeUrl: nyaaUrl,
      aniwaveEpisodeUrl: aniwaveUrl,
      releaseId,
      season: seasonNumber,
      userId: user.userId,
    });
  } catch (err) {
    throw new Error("Failed to update database.");
  }

  revalidatePath("/", "page");
  return {
    message: "Successfully marked episode as watched",
  };
}

export async function untrackRelease(releaseId: string, formData: FormData) {
  try {
    await db
      .update(release)
      .set({
        isTracking: false,
      })
      .where(eq(release.uuid, releaseId));
  } catch (err) {
    throw new Error("Failed to update database.");
  }

  revalidatePath("/", "page");
  return {
    message: "Release is no longer being tracked",
  };
}
