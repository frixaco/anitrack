"use client";
import { SignIn, SignOut } from "@/components/auth";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
const supabase = createClient();

export default function Index() {
  const [user, setUser] = useState({});
  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      setUser(user);
    })();
  }, []);
  //
  // const { data: users } = await supabase.from("users").select();

  return (
    <main className="flex flex-col gap-6 p-4">
      <h1 className="text-3xl font-bold">Anitrack</h1>

      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="Enter URL here" />
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nyaa.si">nyaa.si</SelectItem>
            <SelectItem value="9animetv.to">9animetv.to</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <pre className="py-6 px-4 whitespace-pre-wrap break-all">
        <SignIn />
        <SignOut />

        <p>Session:</p>
        {JSON.stringify(user, null, 2)}

        <br />

        <p>Users:</p>
        {/* {JSON.stringify(users, null, 2)} */}
      </pre>
    </main>
  );
}
