"use server";
// "server-only";

import { db } from "@/db";
import { episode, release } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { JSDOM } from "jsdom";
import { revalidatePath } from "next/cache";

export async function getUnwatchedEpisodes() {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }
  const eps = await db.query.episode.findMany({
    where: eq(episode.isWatched, false),
    with: {
      release: true,
    },
  });

  return eps;
}

export async function markAsWatched(episodeId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  await db
    .update(episode)
    .set({ isWatched: true })
    .where(eq(episode.id, episodeId));

  revalidatePath("/");
}

const processHianimeUrl = async (
  hianimeUrl: string
): Promise<{
  data: {
    episodes: {
      url: string;
      title: string;
      episodeNumber: number;
      episodeId: string;
    }[];
    title: string;
    titleId: string;
    thumbnailUrl: string | null;
    year: number;
    season: string;
    totalEpisodes: number;
  } | null;
  error: string | null;
}> => {
  const getTitleId = (url: string) => {
    const id = url.split("-").pop();
    return id;
  };
  const titleId = getTitleId(`https://hianime.to/watch${hianimeUrl}`);
  if (!titleId) {
    return {
      data: null,
      error: "No title ID found",
    };
  }

  const res = await fetch(`https://hianime.to/ajax/v2/episode/list/${titleId}`);
  if (!res.ok) {
    return {
      data: null,
      error: "Failed to fetch episodes",
    };
  }
  const data: { html: string; status: boolean } = await res.json();

  const dom = new JSDOM(data.html);
  const doc = dom.window.document;

  const episodes: {
    url: string;
    title: string;
    episodeNumber: number;
    episodeId: string;
  }[] = [];
  const episodeElements = doc.querySelectorAll(".ssl-item.ep-item");

  episodeElements.forEach((element) => {
    const href = element.getAttribute("href");
    const title = element.getAttribute("title");
    const episodeNumber = parseInt(element.getAttribute("data-number") || "0");
    const episodeId = element.getAttribute("data-id");

    if (!href || !title || !episodeNumber || !episodeId) {
      return {
        data: null,
        error: "Missing data for an episode",
      };
    }

    episodes.push({
      url: `https://hianime.to${href}`,
      title,
      episodeNumber,
      episodeId,
    });
  });

  const detailsRes = await fetch(`https://hianime.to${hianimeUrl}`);
  const detailsHTML = await detailsRes.text();
  const detailsDom = new JSDOM(detailsHTML);
  const detailsDoc = detailsDom.window.document;

  const thumbnailUrl = detailsDoc
    .querySelector(".anis-cover")
    ?.getAttribute("style")
    ?.split("url(")[1]
    .split(")")[0];

  const titleElement = detailsDoc.querySelector(".anisc-detail .film-name");
  if (!titleElement) {
    return {
      data: null,
      error: "No title element found",
    };
  }
  const title =
    titleElement.getAttribute("data-jname") || titleElement.textContent!;
  if (!title) {
    return {
      data: null,
      error: "No title found",
    };
  }

  const numbersRes = await fetch(`https://hianime.to${hianimeUrl}`);
  const numbersHTML = await numbersRes.text();
  const numbersDom = new JSDOM(numbersHTML);
  const numbersDoc = numbersDom.window.document;

  const premieredElement = Array.from(
    numbersDoc.querySelectorAll(".item-title")
  ).find((el) => el.querySelector(".item-head")?.textContent === "Premiered:");

  const seasonInfo = premieredElement
    ?.querySelector(".name")
    ?.textContent?.split(" ");

  const season = seasonInfo?.[0] || "Unknown"; // "Fall"
  const premieredYear = parseInt(seasonInfo?.[1] || "0"); // "2024"
  const totalEpisodes = parseInt(
    numbersDoc.querySelector(".film-stats .tick-eps")?.textContent || "0"
  );

  return {
    data: {
      episodes,
      title,
      titleId,
      thumbnailUrl: thumbnailUrl ?? null,
      year: premieredYear,
      season,
      totalEpisodes,
    },
    error: null,
  };
};

export async function trackRelease(hianimeUrl: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const { data, error } = await processHianimeUrl(hianimeUrl);
    if (error || !data) {
      return {
        success: false,
        error: error || "Failed to process hianime URL",
      };
    }

    const newRelease = await db
      .insert(release)
      .values({
        hianimeId: data.titleId,
        title: data.title,
        year: data.year,
        season: data.season,
        thumbnailUrl: data.thumbnailUrl,
        totalEpisodes: data.totalEpisodes,
      })
      .returning({ id: release.id });

    const newReleaseId = newRelease[0].id;

    for (const item of data.episodes) {
      await db.insert(episode).values({
        hianimeId: item.episodeId,
        url: item.url,
        title: item.title,
        isWatched: false,
        episodeNumber: item.episodeNumber,
        releaseId: newReleaseId,
      });
    }

    revalidatePath("/");
    return {
      success: true,
      message: "Release is now being tracked",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "An error occurred while tracking the release",
    };
  }
}
