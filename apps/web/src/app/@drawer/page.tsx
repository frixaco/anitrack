import AddReleaseDrawer from "@/app/_components/add-release-drawer";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const user = auth();

  // TODO: allow unregistered users
  // let userId = user.userId;
  // if (user.userId == null) {
  //   userId = randomUUID();
  // }

  return (
    user.userId != null && (
      <AddReleaseDrawer disabled={user.userId === null} userId={user.userId} />
    )
  );
}
