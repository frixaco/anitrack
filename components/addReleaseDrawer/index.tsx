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

export default async function AddReleaseDrawer() {
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
              Enter either <u>nyaa.si</u> or <u>9animetv.to</u> URL
            </DrawerTitle>
            <DrawerDescription>
              Anitrack will start tracking the release using the link
            </DrawerDescription>

            <label className="pt-4">
              <Input
                required
                name="nineanimeUrl"
                type="url"
                placeholder="Enter URL here"
              />
            </label>

            <label className="pt-4">
              <Input
                required
                name="nyaaUrl"
                type="url"
                placeholder="Enter URL here"
              />
            </label>
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
