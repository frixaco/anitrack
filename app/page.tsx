import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function Index() {
  return (
    <main className="flex flex-col gap-6 p-4">
      <Header />

      <form className="grid grid-cols-1 gap-4">
        <label>
          <Input required name="url" type="url" placeholder="Enter URL here" />
        </label>

        <Button size="lg" className="font-bold tracking-wide" type="submit">
          Start Tracking
        </Button>
      </form>

      <section>
        <h2 className="font-semibold text-lg">New Episodes</h2>
      </section>

      <section>
        <h2 className="font-semibold text-lg">Tracking</h2>
      </section>
    </main>
  );
}
