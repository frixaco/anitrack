"use client";

import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/use-debounce";

export function SearchReleases() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [results, setResults] = useState<
    {
      id: string;
      title: string;
      thumbnail: string;
      episodes: string;
      type: string;
      url: string;
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
    fetch(`/search?q=${debouncedSearch}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="enter anime title to search hianime.to"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ScrollArea className="h-[150px] p-2 border rounded-md">
        {loading ? (
          <p className="text-xs text-secondary-foreground">searching...</p>
        ) : results.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {results.map(({ id, title, thumbnail, episodes, type, url }) => (
              <div
                key={id}
                className={cn(
                  "flex items-stretch gap-2 border rounded-md hover:border-accent-foreground hover:border-dashed",
                  {
                    "border-accent-foreground hover:border-solid":
                      selected === url,
                  }
                )}
                onClick={() => setSelected(url)}
              >
                <Image
                  src={thumbnail}
                  alt={title}
                  className="rounded-tl-md rounded-bl-md"
                  width={100}
                  height={133}
                />
                <div className="flex flex-col w-1/2 gap-2">
                  <p className="line-clamp-2 overflow-hidden overflow-ellipsis">
                    {title}
                  </p>
                  <p>{episodes}</p>
                  <p>{type}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-secondary-foreground">no results</p>
        )}
      </ScrollArea>
    </div>
  );
}
