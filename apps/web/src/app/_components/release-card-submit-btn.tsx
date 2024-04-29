"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Eye } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full rounded-xl">
      {pending ? <Spinner className="px-4" /> : <Eye />}
      <span className="pl-2 hidden sm:block">Mark as watched</span>
    </Button>
  );
}
