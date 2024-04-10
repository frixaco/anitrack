"use server";

import { revalidatePath } from "next/cache";

export async function addRelease(formData: FormData) {
  const nyaaUrl = formData.get("nyaaUrl");
  const aniwaveUrl = formData.get("aniwaveUrl");
  const userId = formData.get("userId");

  const response = await fetch(`${process.env.API_URL!}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nyaaUrl,
      aniwaveUrl,
      userId,
    }),
  });

  console.log("Response: ", await response.json());

  revalidatePath("/", "page");
  return { message: "Finished" };
}
