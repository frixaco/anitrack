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
          <DialogDescription>Sorted by seeders</DialogDescription>
        </DialogHeader>
        {/* <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div> */}
        <SearchNyaaReleases defaultSearch={defaultSearch} />
        <DialogFooter>
          <Button type="submit">Stream {">>>"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
