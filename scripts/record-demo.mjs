import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const APP_URL = process.env.DEMO_APP_URL || "http://127.0.0.1:3000";
const OUTPUT_DIR =
  process.env.DEMO_OUTPUT_DIR ||
  path.join("/tmp", `preview-wallet-demo-${Date.now()}`);

async function ensureVisible(locator, description) {
  await locator.waitFor({ state: "visible", timeout: 30000 });
  console.log(`Visible: ${description}`);
}

async function clickWhenReady(locator, description) {
  await ensureVisible(locator, description);
  await locator.click();
  console.log(`Clicked: ${description}`);
}

async function recordDemo() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1440, height: 1080 },
    },
  });

  const page = await context.newPage();
  const consoleMessages = [];

  page.on("console", (message) => {
    const entry = `[console:${message.type()}] ${message.text()}`;
    consoleMessages.push(entry);
    console.log(entry);
  });

  page.on("pageerror", (error) => {
    const entry = `[pageerror] ${error.message}`;
    consoleMessages.push(entry);
    console.error(entry);
  });

  try {
    await page.goto(APP_URL, { waitUntil: "networkidle", timeout: 60000 });
    await ensureVisible(
      page.getByRole("heading", { name: /preview wallet for next\.js app router/i }),
      "demo heading"
    );
    await page.waitForTimeout(1500);

    const connectWalletButton = page.getByRole("button", {
      name: /connect wallet/i,
    });
    await clickWhenReady(connectWalletButton, "Connect Wallet button");
    await page.waitForTimeout(1000);

    const previewWalletButton = page
      .getByRole("button", { name: /^Preview Wallet$/ })
      .last();
    await clickWhenReady(previewWalletButton, "Preview Wallet connector button");

    await ensureVisible(
      page.getByRole("button", { name: /sign a message/i }),
      "Sign a message button"
    );
    await page.waitForTimeout(1000);

    await clickWhenReady(
      page.getByRole("button", { name: /sign a message/i }),
      "Sign a message button"
    );

    const approveButton = page.locator("button.preview-wallet-approve").first();
    await clickWhenReady(approveButton, "Preview Wallet approve button");

    const signedResult = page.getByText(/Signed successfully:/);
    await ensureVisible(signedResult, "signature success message");
    const signatureText = await signedResult.textContent();

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "signed-message.png"),
      fullPage: true,
    });

    await writeFile(
      path.join(OUTPUT_DIR, "result.json"),
      JSON.stringify(
        {
          appUrl: APP_URL,
          outputDir: OUTPUT_DIR,
          signatureText,
          recordedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    await writeFile(
      path.join(OUTPUT_DIR, "browser.log"),
      `${consoleMessages.join("\n")}\n`
    );

    await page.waitForTimeout(2000);
  } finally {
    const video = page.video();
    await page.close();
    await context.close();
    await browser.close();

    if (video) {
      const recordedPath = await video.path();
      const requestedPath = path.join(OUTPUT_DIR, "preview-wallet-demo.webm");
      let finalPath = recordedPath;

      try {
        await rename(recordedPath, requestedPath);
        finalPath = requestedPath;
      } catch {
        // If the browser already used the target name, keep the original file.
      }

      console.log(`Video saved to ${finalPath}`);
    }
  }

  console.log(`Artifacts written to ${OUTPUT_DIR}`);
}

recordDemo().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
