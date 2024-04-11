"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markEpisodeWatched(
  {
    lastWatchedEpisode,
    releaseId,
    nyaaUrl,
    aniwaveUrl,
    seasonNumber,
  }: {
    lastWatchedEpisode: number;
    releaseId: string;
    nyaaUrl: string;
    aniwaveUrl: string;
    seasonNumber: number;
  },
  _formData: FormData,
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user == null) {
    return {
      message: "User is not authorized",
    };
  }

  const { error } = await supabase
    .from("release")
    .update({
      lastWatchedEpisode,
    })
    .eq("id", releaseId);

  await supabase
    .from("watchHistory")
    .insert({
      episodeNumber: lastWatchedEpisode,
      nyaaUrl,
      aniwaveUrl,
      releaseId,
      seasonNumber,
      userId: user.id,
    })
    .eq("id", releaseId);

  revalidatePath("/", "page");
  return {
    message: error?.message || "Successfully marked episode as watched",
  };
}
