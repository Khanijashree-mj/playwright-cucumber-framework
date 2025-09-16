import {
  After,
  AfterAll,
  AfterStep,
  Before,
  BeforeAll,
  Status,
} from "@cucumber/cucumber";
import { pageFixture } from "../fixtures/pageFixture";
import { Browser, BrowserContext, Page, chromium } from "@playwright/test";
const fs = require("fs-extra");

let browser: Browser;
let page: Page;
let context: BrowserContext;
BeforeAll(async function () {
  browser = await chromium.launch({ headless: false, slowMo: 50 });
  console.log(browser.version);
});
Before(async function ({ pickle }) {
  const scenarioName = pickle.name + pickle.id;

  context = await browser.newContext({
    ignoreHTTPSErrors: true,
    recordVideo: {
      dir: "test-results/videos",
    },
  });
  await context.tracing.start({
    name: scenarioName,
    title: pickle.name,
    sources: true,
    screenshots: true,
    snapshots: true,
  });
  page = await context.newPage();
  
  // Maximize the browser window
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  pageFixture.page = page;
});

AfterStep(async function ({ pickle }) {
  const img = await pageFixture.page.screenshot({
    path: `./test-results/screenshot/${pickle.name}.png`,
    type: "png",
  });
  await this.attach(img, "image/png");
});

After(async function ({ pickle, result }) {
  let videoPath: string = "";
  let img: Buffer | undefined;
  const path = `./test-results/trace/${pickle.id}.zip`;

  if (result?.status === Status.PASSED) {
    img = await pageFixture.page.screenshot({
      path: `./test-results/screenshot/${pickle.name}.png`,
      type: "png",
    });

    videoPath = (await pageFixture.page.video()?.path()) ?? "";
  }

  await context.tracing.stop({ path });
  await pageFixture.page.close();
  await context.close();

  if (result?.status === Status.PASSED) {
    if (img) {
      await this.attach(img, "image/png");
    }

    if (videoPath) {
      try {
        const videoBuffer = fs.readFileSync(videoPath);
        await this.attach(videoBuffer, "video/webm");
      } catch (error) {
        console.error("Failed to read video file:", error);
      }
    }

    const traceFileLink = `<a href="https://trace.playwright.dev/">Open ${path}</a>`;
    await this.attach(`Trace file: ${traceFileLink}`, "text/html");
    await pageFixture.page.close();
    await context.close();
  }
});

AfterAll(async function () {
  browser.close();
});
