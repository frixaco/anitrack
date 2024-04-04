import { signin } from "@/app/auth/signin/action";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";

export function SignIn() {
  return (
    <form action={signin}>
      <Button className="px-2">
        <LogIn />
      </Button>
    </form>
  );
}
