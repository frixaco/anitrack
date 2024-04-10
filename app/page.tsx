import AddReleaseDrawer from "@/components/addReleaseDrawer";
import Header from "@/components/header";
import NewEpisodesSection from "@/components/newEpisodesSection";
import TrackedAnimesSection from "@/components/trackedAnimesSection";
import WatchHistory from "@/components/watchHistory";
import { createClient } from "@/lib/supabase/server";

export default async function Index() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-col gap-6 p-4">
      <Header />

      {user && <AddReleaseDrawer userId={user.id} />}

      <NewEpisodesSection />

      <WatchHistory />

      <TrackedAnimesSection />
    </main>
  );
}
