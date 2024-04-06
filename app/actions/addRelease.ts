"use server";

export async function addRelease(formData: FormData) {
  const url = formData.get("url");

  // check if it's nyaa.si link or 9animetv.to link
  // nyaa.si link example (uploader + release title): https://nyaa.si/?f=0&c=1_2&q=ember+frieren
  // 9animetv.to link example (release page with all eps): https://9animetv.to/watch/frieren-beyond-journeys-end-18542?ep=107257

  const response = await fetch(process.env.API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
    }),
  });

  console.log("Response: ", await response.json());

  return {
    message: "Finished",
  };
}
