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
    throw new Error("User not authenticated");
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
  console.log("processing hianime url", hianimeUrl);

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

  const res = await fetch(
    `https://hianime.to/ajax/v2/episode/list/${titleId}`,
    {
      headers: justInCaseBrowserHeaders,
    }
  );
  if (!res.ok) {
    console.log("failed to fetch episodes", res);
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
  console.log("found", episodeElements.length, "episodes");

  episodeElements.forEach((element) => {
    const href = element.getAttribute("href");
    console.log("found episode href", href);
    const title = element.getAttribute("title");
    console.log("found episode", title);
    const episodeNumber = parseInt(element.getAttribute("data-number") || "0");
    console.log("found episode number", episodeNumber);
    const episodeId = element.getAttribute("data-id");
    console.log("found episode id", episodeId);

    if (!href || !title || !episodeNumber || !episodeId) {
      console.error(
        "No href or title found for an episode: ",
        element.outerHTML
      );
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

  console.log("fetching details for", `https://hianime.to${hianimeUrl}`);
  const detailsRes = await fetch(`https://hianime.to${hianimeUrl}`, {
    headers: justInCaseBrowserHeaders,
  });
  const detailsHTML = await detailsRes.text();
  const detailsDom = new JSDOM(detailsHTML);
  const detailsDoc = detailsDom.window.document;

  const thumbnailUrl = detailsDoc
    .querySelector(".anis-cover")
    ?.getAttribute("style")
    ?.split("url(")[1]
    .split(")")[0];
  console.log("found thumbnail url", thumbnailUrl);

  const titleElement = detailsDoc.querySelector(".anisc-detail .film-name");
  console.log("found title element", titleElement);
  if (!titleElement) {
    return {
      data: null,
      error: "No title element found",
    };
  }
  const title =
    titleElement.getAttribute("data-jname") || titleElement.textContent!;
  console.log("found title", title);
  if (!title) {
    return {
      data: null,
      error: "No title found",
    };
  }

  const numbersRes = await fetch(`https://hianime.to${hianimeUrl}`, {
    headers: {
      ...justInCaseBrowserHeaders,
    },
  });
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

const justInCaseBrowserHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  Connection: "keep-alive",
};

export async function trackRelease(hianimeUrl: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await processHianimeUrl(hianimeUrl);
  if (error || !data) {
    console.log(error);
    console.log(data);
    throw new Error("Failed to process hianime URL");
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
}
