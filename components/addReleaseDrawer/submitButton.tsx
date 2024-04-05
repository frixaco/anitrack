"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

export default function SubmitButton() {
  const formStatus = useFormStatus();

  return (
    <Button
      disabled={formStatus.pending}
      className="font-semibold"
      type="submit"
    >
      Add
    </Button>
  );
}
