import AddReleaseDrawer from "@/components/addReleaseDrawer";
import Header from "@/components/header";
import NewEpisodesSection from "@/components/newEpisodesSection";
import TrackedAnimesSection from "@/components/trackedAnimesSection";
import WatchHistory from "@/components/watchHistory";

export default async function Index() {
  return (
    <main className="flex flex-col gap-6 p-4">
      <Header />

      <AddReleaseDrawer />

      <NewEpisodesSection />

      <WatchHistory />

      <TrackedAnimesSection />
    </main>
  );
}
