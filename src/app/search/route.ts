import { JSDOM } from "jsdom";
import { NextRequest, NextResponse } from "next/server";

function extractAnimeInfo(document: Document) {
  // Get all anime items
  const animeItems = document.querySelectorAll(".flw-item");

  // Array to store results
  const results: {
    title: string;
    thumbnail: string;
    episodes: number;
    type: string;
    id: string;
    url: string;
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
      ? parseInt(episodeElement.textContent || "1")
      : 1;

    // Extract year and season from metadata
    const infoElement = item.querySelector(".fd-infor");
    const type = infoElement
      ? (infoElement.querySelector(".fdi-item")?.textContent || "").trim()
      : "";

    // Create result object
    const result = {
      title,
      url: titleElement?.getAttribute("href") || "",
      thumbnail,
      episodes,
      type,
      id: titleElement?.getAttribute("href")?.split("-").pop() || "",
      // Note: Year and season aren't directly available in the HTML
      // Would need to parse from title or additional API calls
    };

    results.push(result);
  });

  return results;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchTerm = searchParams.get("q");

  if (!searchTerm) {
    return NextResponse.json(
      { error: "No search term provided" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `https://hianime.to/search?keyword=${searchTerm.replace(" ", "+")}`
  );
  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const results = extractAnimeInfo(doc);

  return NextResponse.json(results);
}
