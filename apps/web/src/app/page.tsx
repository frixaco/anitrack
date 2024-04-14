import AddReleaseDrawer from "./_components/add-release-drawer";
import { auth } from "@clerk/nextjs/server";
import NewEpisodesSection from "./_components/new-episodes-section";
import WatchHistory from "./_components/watch-history";
import TrackedAnimesSection from "./_components/tracked-animes-section";

export default async function Home() {
  const user = auth();

  return (
    <main className="flex flex-col gap-6 p-4">
      {user.userId != null && <AddReleaseDrawer userId={user.userId} />}

      <NewEpisodesSection />

      <WatchHistory />

      <TrackedAnimesSection />
    </main>
  );
}
