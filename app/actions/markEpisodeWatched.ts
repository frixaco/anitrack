"use server";

import { createClient } from "@/lib/supabase/server";

export async function markEpisodeWatched(
  {
    lastWatchedEpisode,
    releaseId,
  }: {
    lastWatchedEpisode: number;
    releaseId: string;
  },
  formData: FormData,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("release")
    .update({
      lastWatchedEpisode,
    })
    .eq("id", releaseId);

  return {
    message: error?.message || "Successfully marked episode as watched",
  };
}
