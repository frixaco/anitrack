"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import ThemeSwitcher from "./theme-switcher";

export function Header() {
  return (
    <header className="p-4 flex items-center justify-between">
      <div className="flex flex-col items-start">
        <p className="text-lg font-bold leading-none">Anitrack</p>

        <p className="text-sm font-semibold leading-none">Welcome!</p>
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />

        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
