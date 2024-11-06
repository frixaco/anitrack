"server-only";

import { db } from "@/db";
import { episode, release } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { JSDOM } from "jsdom";

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
}
const processHianimeUrl = async (
  hianimeUrl: string
): Promise<{
  data: {
    episodes: {
      url: string;
      title: string;
      episodeNumber: string;
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
  /**
   * Supported hianime URL formats:
   * - https://hianime.to/watch/blue-lock-season-2-19318?ep=128447
   * - https://hianime.to/watch/blue-lock-season-2-19318?ep=128447&ep=128447
   * - https://hianime.to/blue-lock-season-2-19318
   */
  const getTitleId = (url: string) => {
    const pathPart = url.split("?")[0];
    const id = pathPart.split("-").pop();

    return id;
  };
  const titleId = getTitleId(hianimeUrl);
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
    episodeNumber: string;
    episodeId: string;
  }[] = [];
  const episodeElements = doc.querySelectorAll(".ssl-item.ep-item");

  episodeElements.forEach((element) => {
    const href = element.getAttribute("href");
    const title = element.getAttribute("title");
    const episodeNumber = element.getAttribute("data-number");
    const episodeId = element.getAttribute("data-id");

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

  const detailsRes = await fetch(hianimeUrl, {
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

  const titleElement = detailsDoc.querySelector(".os-item.active");
  if (!titleElement) {
    return {
      data: null,
      error: "No title element found",
    };
  }
  const title = titleElement.getAttribute("title");
  if (!title) {
    return {
      data: null,
      error: "No title found",
    };
  }

  const numbersRes = await fetch(hianimeUrl.replace("/watch", ""), {
    headers: {
      ...justInCaseBrowserHeaders,
    },
  });
  const numbersHTML = await numbersRes.text();
  // writeFile("numbers.html", numbersHTML);
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
    numbersDoc.querySelector(".tick-eps")?.textContent || "0"
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

export async function trackRelease({
  hianimeUrl,
  nyaasiUrl,
}: {
  hianimeUrl: string;
  nyaasiUrl: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await processHianimeUrl(hianimeUrl);
  if (error || !data) {
    throw new Error("Failed to process hianime URL");
  }

  await db.insert(release).values({
    hianimeId: data.titleId,
    title: data.title,
    year: data.year,
    season: data.season,
    thumbnailUrl: data.thumbnailUrl,
    totalEpisodes: data.totalEpisodes,
  });

  console.log(nyaasiUrl);
}

function extractAnimeInfo(document: Document) {
  // Get all anime items
  const animeItems = document.querySelectorAll(".flw-item");

  // Array to store results
  const results: {
    title: string;
    thumbnail: string;
    episodes: number;
    type: string;
  }[] = [];

  animeItems.forEach((item) => {
    // Extract title
    const titleElement = item.querySelector(".film-name a");
    const title = titleElement ? titleElement.getAttribute("title") || "" : "";

    // Extract thumbnail URL
    const imgElement = item.querySelector(".film-poster-img");
    const thumbnail = imgElement
      ? imgElement.getAttribute("data-src") || ""
      : "";

    // Extract number of episodes
    const episodeElement = item.querySelector(".tick-eps");
    const episodes = episodeElement
      ? parseInt(episodeElement.textContent || "0")
      : 0;

    // Extract year and season from metadata
    const infoElement = item.querySelector(".fd-infor");
    const type = infoElement
      ? (infoElement.querySelector(".fdi-item")?.textContent || "").trim()
      : "";

    // Create result object
    const result = {
      title,
      thumbnail,
      episodes,
      type,
      // Note: Year and season aren't directly available in the HTML
      // Would need to parse from title or additional API calls
    };

    results.push(result);
  });

  return results;
}

export async function searchReleases(query: string) {
  const response = await fetch(
    `https://hianime.to/search?keyword=${query.replace(" ", "+")}`
  );
  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const results = extractAnimeInfo(doc);

  return results;
}
