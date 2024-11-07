import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Play } from "lucide-react";
import { SearchNyaaReleases } from "./search-nyaa-results";

export function StreamTorrentButton({
  defaultSearch,
}: {
  defaultSearch: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-400 font-bold flex-1">
          <Play className="inline-flex" size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Select the upload</DialogTitle>
          <DialogDescription>
            Try searching with different titles if you don&apos;t find the right
            release, sorted by seeders
          </DialogDescription>
        </DialogHeader>

        <SearchNyaaReleases defaultSearch={defaultSearch} />

        <DialogFooter>
          <Button type="submit">Stream {">>>"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
