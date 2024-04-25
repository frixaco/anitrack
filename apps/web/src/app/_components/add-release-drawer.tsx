"use client";

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
import { Spinner } from "@/components/ui/spinner";
import { addRelease } from "@/server/queries";
import { useFormState, useFormStatus } from "react-dom";

// TODO: Add live search, auto search on nyaa.si and 9animetv.to
// TODO: Ideally, I should be able to add new release by its title only
// TODO: Ideally, I should parse the subtitles from the video,
//         summarize it and add it to release description.
//         This requires downloading the anime (easier for nyaa.si, but idk for aniwave.to),
//         for which I can ask user's permission to use their Google Drive
// TODO: Add batch download link to download batch torrent file

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={pending}
      aria-disabled={pending}
      className="font-semibold"
      type="submit"
    >
      {pending ? <Spinner className="px-4" /> : "Add"}
    </Button>
  );
}

export default function AddReleaseDrawer({
  userId,
  disabled,
}: {
  userId: string | null;
  disabled: boolean;
}) {
  const [state, action] = useFormState(addRelease, {
    errors: {},
    success: false,
  });

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          disabled={disabled}
          aria-disabled={disabled}
          size="lg"
          className="font-bold tracking-wide"
        >
          Add Release
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <form action={action} className="grid grid-cols-1 pt-4">
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
              <p aria-live="polite" className="sr-only" role="status">
                {state.errors.aniwaveUrl}
              </p>
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
              <p aria-live="polite" className="sr-only" role="status">
                {state.errors.nyaaUrl}
              </p>
            </label>

            <input name="userId" value={userId} type="hidden" />
          </DrawerHeader>

          <p aria-live="polite" className="sr-only" role="status">
            {state?.success ? "Success" : "Failure"}
          </p>

          <DrawerFooter>
            <SubmitButton />

            <DrawerClose className="py-4">Cancel</DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
