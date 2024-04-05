import { signin } from "@/app/actions/signin";
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
