import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import ThemeSwitcher from "./theme-switcher";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export async function Header() {
  return (
    <header className="w-screen p-4 flex items-center justify-between">
      <div className="flex flex-col items-start">
        <p className="text-lg font-bold leading-none">Anitrack</p>

        <p className="text-sm font-semibold leading-none">Welcome!</p>
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />

        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <Button variant="ghost" className="px-2">
              <LogIn />
              <span className="pl-2 hidden sm:block">Sign In</span>
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
