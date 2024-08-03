import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { chromium } from "playwright";

import payload from "../payload.json";

async function scrape() {
  // Launch a browser with realistic settings
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // Function to simulate human-like delays
  const humanDelay = (min: number, max: number) =>
    new Promise((resolve) =>
      setTimeout(resolve, Math.random() * (max - min) + min),
    );

  // Navigate to the website
  await page.goto(payload.aniwaveUrl, { waitUntil: "networkidle" });

  // Wait for the necessary DOM to be rendered
  await page.waitForSelector("h1");

  // Simulate human-like interactions
  await humanDelay(1000, 3000); // Random delay between 1-3 seconds

  // Extract data
  const data = await page.evaluate(() => {
    const heading = document.querySelector("h1")?.textContent;
    return {
      heading,
    };
  });

  console.log(data);

  // Close the browser
  await browser.close();
}

const app = new Hono();

app.post("/scrape", async (c) => {
  await scrape();

  return c.text("Hello Hono!");
});

const port = 4000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
