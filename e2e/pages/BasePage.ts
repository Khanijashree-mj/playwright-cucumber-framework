import { Page } from "@playwright/test";
import { CommonFunctions } from "../utils/CommonFunctions";

// Simple Base Page - provides common utilities to all page objects
export abstract class BasePage {
  protected page: Page;
  protected common: CommonFunctions;

  constructor(page: Page) {
    this.page = page;
    this.common = new CommonFunctions(page);
  }

  // Essential common methods
  async getPageTitle(): Promise<string> {
    return await this.common.getPageTitle();
  }

  async getPageUrl(): Promise<string> {
    return await this.common.getCurrentUrl();
  }

  async waitForPageLoad(): Promise<void> {
    await this.common.waitForPageLoad();
  }

  async takeScreenshot(name?: string): Promise<void> {
    if (name) {
      await this.common.takeScreenshot(name);
    } else {
      await this.page.screenshot({ fullPage: true });
    }
  }


  // Abstract method that child classes must implement
  abstract verifyPageIsLoaded(): Promise<void>;
}


