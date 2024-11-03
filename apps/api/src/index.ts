import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { drizzle } from "drizzle-orm/node-postgres";
import { z } from "zod";

import { JSDOM } from "jsdom";

import { writeFile } from "fs/promises";

const db = drizzle(process.env.DATABASE_URL);

const app = new Hono();

app.use("*", cors());
app.use(logger());

const justInCaseBrowserHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  Connection: "keep-alive",
};

const schema = z.object({
  userId: z.string(),
  hianimeUrl: z.string(),
  nyaasiUrl: z.string(),
});

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

  return {
    data: { episodes, title, titleId },
    error: null,
  };
};

app.post("/scrape", async (c) => {
  const body = await c.req.json();
  const { userId, hianimeUrl, nyaasiUrl } = schema.parse(body);

  const { data, error } = await processHianimeUrl(hianimeUrl);
  if (error || !data) {
    return c.json({ error }, 500);
  }
  const { episodes, title, titleId } = data;

  return c.json({ episodes, title, titleId });
});

export default app;
