import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

export function SignOut() {
  return (
    <form method="post" action="/auth/signout">
      <Button variant="ghost" className="px-2">
        <LogOut />
        <span className="hidden sm:block">Sign Out</span>
      </Button>
    </form>
  );
}
