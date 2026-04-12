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

import { auth } from "@clerk/nextjs/server";

export async function AddAnimeDrawer() {
  const { userId } = await auth();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="relative rounded-md md:py-10 w-full md:px-16 py-6 px-12 md:w-min">
          <Plus />
          <span className="size-[120px] hidden md:block absolute border-r border-b border-dotted border-accent-foreground -z-20 bottom-1/2 left-36"></span>
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

          <SearchHianimeReleases isAuthenticated={!!userId} />

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
