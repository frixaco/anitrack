import { addRelease } from "@/app/actions/addRelease";
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
import { Input } from "@/components/ui/input";
import SubmitButton from "./submitButton";

// TODO: Add live search, auto search on nyaa.si and 9animetv.to
// TODO: Ideally, I should be able to select anime by its name only
// TODO: Ideally, I should parse the subtitles from the video,
//         summarize it and add it to release description.
//         This requires downloading the anime (easier for nyaa.si, but idk for 9animetv.to),
//         for which I can ask user's permission to use their Google Drive
// TODO: Add batch download link to download batch torrent file

export default async function AddReleaseDrawer({ userId }: { userId: string }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="lg" className="font-bold tracking-wide">
          Add Release
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <form action={addRelease} className="grid grid-cols-1 pt-4">
          <DrawerHeader>
            <DrawerTitle>
              Enter <u>nyaa.si</u> and <u>aniwave.to</u> URL
            </DrawerTitle>
            <DrawerDescription>
              Anitrack will start tracking the release using the link
            </DrawerDescription>

            <label className="pt-4 text-left text-xs">
              Aniwave URL
              <Input
                required
                name="aniwaveUrl"
                type="url"
                placeholder="Enter URL here"
                value={
                  "https://aniwave.to/watch/dosanko-gal-wa-namaramenkoi.4q12o/ep-1"
                }
              />
            </label>

            <label className="pt-4 text-left text-xs">
              Nyaa.si
              <Input
                required
                name="nyaaUrl"
                type="url"
                placeholder="Enter URL here"
                value={"https://nyaa.si/?f=0&c=1_2&q=ember+hokkaido"}
              />
            </label>

            <input name="userId" value={userId} type="hidden" />
          </DrawerHeader>

          <DrawerFooter>
            <SubmitButton />

            <DrawerClose className="py-4">Cancel</DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
