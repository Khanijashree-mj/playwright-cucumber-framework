import { Page } from "@playwright/test";

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common page methods
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async getPageUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  async takeScreenshot(name?: string): Promise<Buffer> {
    return await this.page.screenshot({ 
      fullPage: true, 
      path: name ? `./test-results/screenshots/${name}.png` : undefined 
    });
  }

  async refreshPage(): Promise<void> {
    await this.page.reload();
  }

  // Abstract method that child classes should implement
  abstract verifyPageIsLoaded(): Promise<void>;
}
