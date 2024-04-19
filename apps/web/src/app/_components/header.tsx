"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import ThemeSwitcher from "./theme-switcher";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function Header() {
  const { user } = useUser();

  return (
    <header className="p-4 flex items-center justify-between">
      <div className="flex flex-col items-start">
        <p className="text-lg font-bold leading-none">Anitrack</p>

        {user ? (
          <p className="text-sm font-semibold leading-none">
            Welcome,{" "}
            <span className="font-bold">
              {user.emailAddresses?.[0].emailAddress || user.fullName}
            </span>
            !
          </p>
        ) : (
          <p className="text-sm font-semibold leading-none">Welcome!</p>
        )}
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
