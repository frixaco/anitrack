import { writeFileSync } from "fs";
import { JSDOM } from "jsdom";
import { NextRequest, NextResponse } from "next/server";

function extractAnimeInfo(document: Document) {
  const animeItems = document.querySelectorAll(".flw-item");

  const results: {
    title: string;
    thumbnail: string;
    episodes: number;
    type: string;
    id: string;
    url: string;
  }[] = [];

  animeItems.forEach((item) => {
    const titleElement = item.querySelector(".film-name a");
    const title = titleElement ? titleElement.getAttribute("title") || "" : "";

    const imgElement = item.querySelector(".film-poster-img");
    const thumbnail = imgElement
      ? imgElement.getAttribute("data-src") || ""
      : "";

    const episodeElement = item.querySelector(".tick-eps");
    const episodes = episodeElement
      ? parseInt(episodeElement.textContent || "1")
      : 1;

    const infoElement = item.querySelector(".fd-infor");
    const type = infoElement
      ? (infoElement.querySelector(".fdi-item")?.textContent || "").trim()
      : "";

    const id = titleElement?.getAttribute("href")?.split("-").pop() || "";
    const url = (titleElement?.getAttribute("href") || "").split("?")[0] || "";

    const result = {
      title,
      url,
      thumbnail,
      episodes,
      type,
      id,
      // TODO: Include year and season
    };

    results.push(result);
  });

  return results;
}

// const justInCaseBrowserHeaders = {
//   "User-Agent":
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
//   Accept:
//     "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
//   "Accept-Language": "en-US,en;q=0.5",
//   Connection: "keep-alive",
// };

async function searchHianime(searchTerm: string) {
  const url = atob("aHR0cHM6Ly9oaWFuaW1lLnRvL3NlYXJjaD9rZXl3b3JkPQ==");
  console.log(url);
  const response = await fetch(`${url}${searchTerm.replace(" ", "+")}`, {
    // method: "GET",
    // headers: justInCaseBrowserHeaders,
  });
  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  writeFileSync("hianime.html", html);

  return extractAnimeInfo(doc);
}

function extractTorrentInfo(document: Document) {
  const rows = document.querySelectorAll("tr.success");

  return Array.from(rows).map((row) => {
    // Find the title by selecting the link that doesn't have a comments class and isn't inside a comments link
    const titleElement = row.querySelector("td:nth-child(2) a:not(.comments)");
    const magnetLink = row.querySelector('a[href^="magnet"]');
    const torrentLink = row.querySelector('a[href^="/download"]');
    const dateCell = row.querySelector("td[data-timestamp]");

    // Extract the text content directly from the title element
    const title = titleElement ? titleElement.getAttribute("title") || "" : "";

    return {
      title: title,
      magnetLink: magnetLink?.getAttribute("href") || "",
      torrentLink: torrentLink?.getAttribute("href") || "",
      seeders: parseInt(
        row.querySelector("td:nth-last-child(3)")?.textContent || "0"
      ),
      leechers: parseInt(
        row.querySelector("td:nth-last-child(2)")?.textContent || "0"
      ),
      uploadDate: new Date(
        parseInt(dateCell?.getAttribute("data-timestamp") || "0") * 1000
      ),
    };
  });
}

async function searchNyaa(searchTerm: string) {
  const url = atob(
    "aHR0cHM6Ly9ueWFhLnNpL3VzZXIvc3Vic3BsZWFzZT9mPTAmYz0wXzAmcT0="
  );
  const response = await fetch(`${url}${searchTerm.replace(" ", "+")}+1080p`);
  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // const results = await tosho.single({
  //   anidbEid: 287784,
  //   resolution: "1080",
  //   exclusions: ["dvd"],
  // });
  // return results.sort((a, b) => b.seeders - a.seeders);

  return extractTorrentInfo(doc);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchTerm = searchParams.get("q");
  const source = searchParams.get("s");

  if (!source) {
    return NextResponse.json({ error: "No source provided" }, { status: 400 });
  }

  if (!searchTerm) {
    return NextResponse.json(
      { error: "No search term provided" },
      { status: 400 }
    );
  }

  if (source !== "hianime" && source !== "nyaa") {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  const results =
    source === "hianime"
      ? await searchHianime(searchTerm)
      : await searchNyaa(searchTerm);

  return NextResponse.json(results);
}
