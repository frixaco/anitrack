import { ModeToggle } from "@/components/theme-switcher";
import { EpisodeList } from "@/components/episode-list";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddAnimeDrawer } from "@/components/add-anime-drawer";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col gap-2 md:gap-4 p-4 md:p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold border border-accent-foreground rounded-md px-2 py-1 border-dotted hover:underline hover:decoration-dashed">
          anitrack
        </h1>

        <span className="relative border-b border-accent-foreground border-dotted flex-1">
          <span className="absolute hidden md:block left-1/2 -translate-x-1/2 border-r border-dotted border-accent-foreground h-9 w-1"></span>
        </span>

        <div className="flex items-center justify-between">
          <ModeToggle />
          <span className="border-b border-accent-foreground w-4 border-dotted flex-1"></span>

          <div className="relative size-9">
            <div className="absolute -z-10 inset-0 border rounded-md border-dotted border-accent-foreground size-9"></div>

            <SignedOut>
              <SignInButton>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-dotted border-accent-foreground"
                >
                  <LogIn />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: {
                      borderRadius: "0.375rem",
                      border: "1px dotted",
                      borderColor: "white",
                      width: "36px",
                      height: "36px",
                    },
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </header>

      <div className="w-full flex flex-col gap-4 relative mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-120px)]">
        <Suspense
          fallback={
            <div className="h-full bg-background rounded-md border border-dashed border-accent-foreground p-2 flex items-center justify-center">
              <span className="text-sm">...loading</span>
            </div>
          }
        >
          <EpisodeList className="h-full" />
        </Suspense>

        <AddAnimeDrawer />
      </div>
    </div>
  );
}
