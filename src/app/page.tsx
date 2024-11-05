import { ModeToggle } from "@/components/theme-switcher";
import { AddAnimeDrawer } from "@/components/add-anime-drawer";
import { EpisodeList } from "@/components/episode-list";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 h-screen p-8">
      <div>
        <ModeToggle />
      </div>

      <EpisodeList className="flex-1" />

      <AddAnimeDrawer />
    </div>
  );
}
