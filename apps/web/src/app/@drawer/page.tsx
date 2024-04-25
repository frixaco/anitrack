import AddReleaseDrawer from "../_components/add-release-drawer";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const user = auth();

  return (
    <AddReleaseDrawer disabled={user.userId === null} userId={user.userId} />
  );
}
