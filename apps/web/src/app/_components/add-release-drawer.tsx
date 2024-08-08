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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";

// TODO: Add live search, auto search on nyaa.si and aniwave.to
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
  userId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, action] = useFormState(addRelease, {
    errors: {},
    success: false,
  });

  const [open, setOpen] = useState(() => searchParams.get("adding") != null);
  const [_, startTransition] = useTransition();

  return (
    <Drawer
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          if (!open) {
            params.delete("adding");
          } else {
            params.set("adding", "true");
          }
          router.push(pathname + "?" + params.toString());
        });
      }}
    >
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
              Enter <u>nyaa.si</u> and <u>aniwave.to</u> URLs
            </DrawerTitle>
            <DrawerDescription>
              <p className="py-4">How to get the URLs:</p>
              <strong className="pt-2">nyaa.si:</strong>
              <ul className="py-2">
                <li>1. Search for Ember&apos;s uploads</li>

                <li>
                  2. Copy the page URL and paste it here - e.g.{" "}
                  <a
                    href="https://nyaa.si/?f=0&c=1_2&q=ember+frieren"
                    target="_blank"
                  >
                    https://nyaa.si/?f=0&c=1_2&q=ember+frieren
                  </a>
                </li>
              </ul>
              <strong className="py-2">aniwave.to:</strong>
              <ul className="py-2">
                <li>1. Search and open the page of the anime</li>

                <li>
                  2. Copy the page URL and paste it here - e.g.{" "}
                  <a
                    href="https://aniwave.to/watch/sousou-no-frieren.1o76z/ep-1"
                    target="_blank"
                  >
                    https://aniwave.to/watch/sousou-no-frieren.1o76z/ep-1
                  </a>
                </li>
              </ul>
            </DrawerDescription>

            <label className="pt-4 text-left text-xs">
              Aniwave URL
              <Input
                required
                name="aniwaveUrl"
                type="url"
                placeholder="Enter URL here"
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
