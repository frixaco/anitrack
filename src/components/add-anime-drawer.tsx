import { Magnet, Play, Plus } from "lucide-react";

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

import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchHianimeReleases } from "./search-hianime-results";
import { SearchNyaaReleases } from "./search-nyaa-results";

export function AddAnimeTabs() {
  return (
    <Tabs defaultValue="hianime" className="px-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="hianime" className="flex items-center gap-2">
          <Play className="inline-flex" size={16} />
          <span>hianime.to</span>
        </TabsTrigger>
        <TabsTrigger value="nyaa.si" className="flex items-center gap-2">
          <Magnet className="inline-flex" size={16} />
          <span>nyaa.si</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="hianime">
        <Card>
          <CardContent className="py-6">
            <SearchHianimeReleases />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="nyaa.si">
        <Card>
          <CardDescription className="px-6 pt-4">
            using{" "}
            <a
              href="https://subsplease.org/"
              className="underline decoration-dotted"
            >
              SubsPlease
            </a>{" "}
            as the uploader (EMBER, Judas, Anime Time are coming)
          </CardDescription>
          <CardContent className="px-6 py-6 pt-3">
            <SearchNyaaReleases />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

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

          <AddAnimeTabs />

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
