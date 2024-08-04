"use server";

import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { release, watchHistory } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { env } from "@/env";

// TODO:
// 1. Register new user
// 2. Add private metada to the user (e.g. allow something)
// const fullUserData = await clerkClient.users.getUser(authorizedUser.userId);
// if (fullUserData.privateMetadata?.["can-do-something"] !== true) {
//   throw new Error("User can't do something");
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
  const user = auth();
  if (!user.userId) throw new Error("Unauthorized");

  const posthog = postHogServerClient();
  posthog.capture({
    distinctId: user.userId,
    event: "release added",
    properties: {
      metadata: "metadata",
    },
  });
  await posthog.shutdown();

  const { success: rateLimited } = await ratelimit.limit(user.userId);

  if (!rateLimited) {
    throw new Error("Rate limit reached");
  }

  const validatedFields = schema.safeParse({
    uuid: randomUUID(),
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

  try {
    const response = await fetch(`${env.API_URL}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nyaaUrl,
        aniwaveUrl,
        userId,
      }),
    });
    await response.json();
  } catch (e) {
    throw new Error("Failed to add the release");
  }

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
  if (!user.userId) throw new Error("Unauthorized");

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

export async function untrackRelease(releaseId: string) {
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

export async function continueTrackingRelease(releaseId: string) {
  try {
    await db
      .update(release)
      .set({
        isTracking: true,
      })
      .where(eq(release.uuid, releaseId));
  } catch (err) {
    throw new Error("Failed to update database.");
  }

  revalidatePath("/", "page");
  return {
    message: "Release is being tracked again",
  };
}

export async function deleteRelease(_releaseId: string) {
  // TODO: implement
}
