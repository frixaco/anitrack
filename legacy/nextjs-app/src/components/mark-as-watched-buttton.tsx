"use client";

import { Button } from "./ui/button";
import { useFormStatus } from "react-dom";

export function MarkAsWatchedButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full"
      disabled={pending}
    >
      mark as watched
    </Button>
  );
}
