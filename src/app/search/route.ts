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

    const result = {
      title,
      url: titleElement?.getAttribute("href") || "",
      thumbnail,
      episodes,
      type,
      id: titleElement?.getAttribute("href")?.split("-").pop() || "",
      // TODO: Include year and season
    };

    results.push(result);
  });

  return results;
}

async function searchHianime(searchTerm: string) {
  const url = atob("aHR0cHM6Ly9oaWFuaW1lLnRvL3NlYXJjaD9rZXl3b3JkPQ==");
  const response = await fetch(`${url}${searchTerm.replace(" ", "+")}`);
  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  return extractAnimeInfo(doc);
}

function extractTorrentInfo(document: Document) {
  const rows = document.querySelectorAll("tr.success");

  return Array.from(rows).map((row) => {
    const titleElement = row.querySelector("td a[title]");
    const magnetLink = row.querySelector('a[href^="magnet"]');
    const torrentLink = row.querySelector('a[href$=".torrent"]');
    const dateCell = row.querySelector("td[data-timestamp]");
    // const [seeders, leechers] = row.querySelectorAll("td.text-center");

    return {
      title: titleElement?.getAttribute("title") || "",
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
  const response = await fetch(`${url}${searchTerm.replace(" ", "+")}`);
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
