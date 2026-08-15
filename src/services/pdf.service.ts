import { chromium, type Browser } from "playwright";
import { EnvConfig } from "@config/env.config";

// ponytail: singleton browser, reused across requests
let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  }
  return browserPromise;
}

export async function generateTripPDF(slug: string): Promise<Buffer> {
  const frontendUrl = EnvConfig.FRONTEND_BASE_URL || "http://localhost:3000";
  const url = `${frontendUrl}/trip/${slug}?print=print`;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // wait for print content to render
    await page.waitForSelector("[data-print-content]", { timeout: 10000 }).catch(() => {});

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
