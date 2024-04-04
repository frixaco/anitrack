import { SignIn } from "@/components/signIn";
import { SignOut } from "@/components/signOut";
import ThemeSwitcher from "@/components/themeSwitcher";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col items-start">
        <p className="text-lg font-bold leading-none">Anitrack</p>

        {user ? (
          <p className="text-sm font-semibold leading-none">
            Welcome,{" "}
            <span className="font-bold">
              {user?.user_metadata?.name || user?.email}
            </span>
            !
          </p>
        ) : (
          <p className="text-sm font-semibold leading-none">Welcome!</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />

        {user ? <SignOut /> : <SignIn />}
      </div>
    </div>
  );
}
