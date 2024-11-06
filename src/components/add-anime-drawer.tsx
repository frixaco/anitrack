import { ListPlus, Plus, Search } from "lucide-react";

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
import { Input } from "./ui/input";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchReleases } from "./search-results";

export function AddAnimeTabs() {
  return (
    <Tabs defaultValue="search" className="px-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search" className="flex items-center gap-2">
          <Search className="inline-flex" size={16} />
          <span>search</span>
        </TabsTrigger>
        <TabsTrigger value="links" className="flex items-center gap-2">
          <ListPlus className="inline-flex" size={16} />
          <span>links</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="search">
        <Card>
          <CardContent className="py-6">
            <SearchReleases />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="links">
        <Card>
          <CardContent className="p-6">
            <Label htmlFor="hianime-url">
              hianime.to url (can point to episode or title page)
            </Label>
            <Input id="hianime-url" type="text" />

            <Label htmlFor="nyaa-url">
              nyaa.si url (when searching include title and uploader name)
            </Label>
            <Input id="nyaa-url" type="text" />
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
              search for an anime or provide links to start tracking.
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
