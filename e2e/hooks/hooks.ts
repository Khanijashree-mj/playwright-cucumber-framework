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
  browser = await chromium.launch({ 
    headless: false, 
    slowMo: 50,
    args: [
      '--start-maximized',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  console.log(browser.version);
});
Before(async function ({ pickle }) {
  const scenarioName = pickle.name + pickle.id;

  context = await browser.newContext({
    ignoreHTTPSErrors: true,
    recordVideo: {
      dir: "test-results/videos",
    },
    // viewport: null makes the page match the browser window size (which is maximized)
    viewport: null
  });
  await context.tracing.start({
    name: scenarioName,
    title: pickle.name,
    sources: true,
    screenshots: true,
    snapshots: true,
  });
  page = await context.newPage();
  
  // Browser window maximized - viewport matches window size (full screen)
  console.log(`✅ Browser maximized - page fills entire window`);
  
  pageFixture.page = page;
});

AfterStep(async function ({ pickle, pickleStep }) {
  // Get all pages/tabs in the current browser context
  const allPages = context.pages();
  
  // Generate a timestamp for unique screenshot naming
  const timestamp = Date.now();
  const stepName = pickleStep?.text?.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) || 'step';
  
  console.log(`📸 Capturing screenshots for ${allPages.length} active page(s) after step: "${pickleStep?.text}"`);
  
  // Capture screenshot of each active page/tab
  for (let i = 0; i < allPages.length; i++) {
    const currentPage = allPages[i];
    try {
      // Check if page is still valid and not closed
      if (!currentPage.isClosed()) {
        const pageTitle = await currentPage.title().catch(() => `page_${i}`);
        const sanitizedTitle = pageTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        
        const screenshotPath = `./test-results/screenshots/${pickle.name}_${stepName}_page${i}_${sanitizedTitle}_${timestamp}.png`;
        
        const img = await currentPage.screenshot({
          path: screenshotPath,
          type: "png",
          fullPage: false, // Capture viewport only for performance
        });
        
        // Attach with descriptive label
        const label = allPages.length > 1 
          ? `📄 Page ${i + 1}/${allPages.length}: ${pageTitle}` 
          : `📄 ${pageTitle}`;
        
        await this.attach(img, "image/png");
        console.log(`  ✅ Screenshot saved: Page ${i + 1} - ${pageTitle}`);
      } else {
        console.log(`  ⚠️  Page ${i + 1} is closed, skipping screenshot`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to capture screenshot for page ${i + 1}:`, error);
    }
  }
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
