"use server";

import { z } from "zod";

const schema = z.object({
  nyaaUrl: z
    .string({
      invalid_type_error: "Invalid URL",
    })
    .url(),
  aniwaveUrl: z
    .string({
      invalid_type_error: "Invalid URL",
    })
    .url(),
  userId: z
    .string({
      invalid_type_error: "Invalid user ID",
    })
    .uuid("Invalid user ID"),
});

import { revalidatePath } from "next/cache";

export async function addRelease(_: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    nyaaUrl: formData.get("nyaaUrl"),
    aniwaveUrl: formData.get("aniwaveUrl"),
    userId: formData.get("userId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { nyaaUrl, aniwaveUrl, userId } = validatedFields.data;

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
  return { errors: {}, success: true };
}
