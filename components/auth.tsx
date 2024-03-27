"use client";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import { signout } from "@/app/auth/signout/action";
import { createClient } from "@/lib/supabase/client";

export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <Button
      {...props}
      onClick={async () => {
        const supabase = createClient();
        const response = await supabase.auth.signInWithOAuth({
          provider: "google",
          // options: {
          //   redirectTo:
          //     "https://myevsotpzreetmmhyodr.supabase.co/auth/v1/callback",
          // },
        });
        console.log(response);
      }}
    >
      <LogIn />
      <span className="hidden sm:block">Sign In</span>
    </Button>
  );
}

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <Button
      variant="ghost"
      {...props}
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
      }}
    >
      Sign Out
    </Button>
  );
}
