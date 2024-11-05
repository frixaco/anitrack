import { ModeToggle } from "@/components/theme-switcher";
import { AddAnimeDrawer } from "@/components/add-anime-drawer";
import { EpisodeList } from "@/components/episode-list";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 h-screen p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold border rounded-md px-2 py-1 border-dashed hover:underline hover:decoration-dashed">
          anitrack
        </h1>

        <span className="border-b border-accent border-dashed flex-1"></span>

        <div className="flex items-center justify-end gap-4">
          <ModeToggle />
          <SignedOut>
            <SignInButton>
              <Button variant="outline" size="icon">
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
                    width: "36px",
                    height: "36px",
                  },
                },
              }}
            />
          </SignedIn>
        </div>
      </header>

      <EpisodeList className="flex-1" />

      <AddAnimeDrawer />
    </div>
  );
}
