"use client";

import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/use-debounce";
import { Loader } from "./loader";
import { Download } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function SearchNyaaReleases({
  defaultSearch,
}: {
  defaultSearch: string;
}) {
  const [searchTerm, setSearchTerm] = useState(defaultSearch);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [results, setResults] = useState<
    {
      title: string;
      magnetLink: string;
      torrentLink: string;
      seeders: number;
      leechers: number;
      uploadDate: string;
    }[]
  >([]);
  const [selected, setSelected] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (debouncedSearch.length < 3) {
      setResults([]);
      setLoading(false);
      setSelected(null);
      return;
    }

    setLoading(true);
    setResults([]);
    fetch(`/search?q=${debouncedSearch}&s=nyaa`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          placeholder="enter anime title to search for torrent releases"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          {loading && <Loader className="w-4 h-4" />}
        </span>
      </div>
      <ScrollArea className="h-[300px] p-2 border rounded-md">
        {loading ? (
          <p className="text-xs text-secondary-foreground">searching...</p>
        ) : results.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {results.map(
              ({
                title,
                magnetLink: _,
                torrentLink,
                seeders,
                leechers,
                uploadDate,
              }) => (
                <div
                  key={title}
                  className={cn(
                    "flex items-stretch gap-2 border rounded-md hover:border-accent-foreground hover:border-dashed",
                    {
                      "border-accent-foreground hover:border-solid":
                        selected === torrentLink,
                    }
                  )}
                  onClick={() => setSelected(torrentLink)}
                >
                  {/* <Image
                    src={thumbnail}
                    alt={title}
                    className="rounded-tl-md rounded-bl-md"
                    width={100}
                    height={133}
                    placeholder="data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMzMzIiBvZmZzZXQ9IjIwJSIgLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzIyMiIgb2Zmc2V0PSI1MCUiIC8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMzMzMiIG9mZnNldD0iNzAlIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIGZpbGw9IiMzMzMiIC8+CiAgPHJlY3QgaWQ9InIiIHdpZHRoPSI3MDAiIGhlaWdodD0iNDc1IiBmaWxsPSJ1cmwoI2cpIiAvPgogIDxhbmltYXRlIHhsaW5rOmhyZWY9IiNyIiBhdHRyaWJ1dGVOYW1lPSJ4IiBmcm9tPSItNzAwIiB0bz0iNzAwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgIC8+Cjwvc3ZnPg=="
                  /> */}
                  <div className="flex flex-col gap-2 p-2">
                    <p className="text-xs overflow-hidden overflow-ellipsis">
                      {title}

                      <a
                        href={torrentLink}
                        target="_blank"
                        className="inline-flex ml-2 align-middle"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </p>

                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-secondary-foreground">
                        seeders: {seeders}
                      </p>
                      <p className="text-xs text-secondary-foreground">
                        leechers: {leechers}
                      </p>
                      <p className="text-xs text-secondary-foreground">
                        uploaded: {new Date(uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-xs text-secondary-foreground">no results</p>
        )}
      </ScrollArea>

      <div className="self-end flex gap-2">
        <Link
          href={`/player?url=${selected}`}
          // TODO: remove pointer-events-none once the player is implemented
          className="pointer-events-none leading-none bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 active:bg-primary/80"
        >
          Stream {">>>"}
        </Link>

        <Button onClick={() => selected && window.open(selected, "_blank")}>
          Download torrent
        </Button>
      </div>
    </div>
  );
}
