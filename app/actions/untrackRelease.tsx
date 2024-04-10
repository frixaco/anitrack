"use server";

import { createClient } from "@/lib/supabase/server";

export async function untrackRelease(releaseId: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("release")
    .update({
      isWatching: false,
    })
    .eq("id", releaseId);

  return {
    message: error?.message || "Release is no longer being tracked",
  };
}
