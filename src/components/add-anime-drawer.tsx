import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { SearchHianimeReleases } from "./search-hianime-results";

export function AddAnimeDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="relative rounded-md md:py-10 md:px-16 py-6 px-12 w-min">
          <Plus />
          <span className="absolute border-r border-b border-dashed -z-20 size-24 bottom-1/2 left-1/2"></span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle>start tracking</DrawerTitle>
            <DrawerDescription>
              select the anime you want to track from hianime.to and/or nyaa.si
            </DrawerDescription>
          </DrawerHeader>

          <SearchHianimeReleases />

          <DrawerFooter>
            <Button>start tracking</Button>
            <DrawerClose asChild>
              <Button variant="outline">cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
