import { SignIn, SignOut } from "@/components/auth";
import { users } from "@/database/schema";
import { db } from "@/lib/db";
import { auth } from "auth";

export default async function Index() {
  const dbUsers = await db.select().from(users);

  const session = await auth();

  return (
    <main className="flex flex-col gap-6">
      <pre className="py-6 px-4 whitespace-pre-wrap break-all">
        <SignIn />
        <SignOut />

        <p>Session:</p>
        {JSON.stringify(session, null, 2)}

        <br />

        <p>Users:</p>
        {JSON.stringify(dbUsers, null, 2)}
      </pre>
    </main>
  );
}
