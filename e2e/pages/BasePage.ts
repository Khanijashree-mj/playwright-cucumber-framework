import { Page } from "@playwright/test";
import { CommonFunctions } from "../utils/CommonFunctions";
import { DynamicLocatorManager } from "../objectRepository/managers/DynamicLocatorManager";
import { TestDataManager } from "../utils/TestDataManager";

// Simple Base Page - provides common utilities to all page objects
export abstract class BasePage {
  protected page: Page;
  protected common: CommonFunctions;
  protected locatorManager: DynamicLocatorManager;
  protected testDataManager: TestDataManager;

  constructor(page: Page) {
    this.page = page;
    this.common = new CommonFunctions(page);
    this.locatorManager = DynamicLocatorManager.getInstance();
    this.testDataManager = TestDataManager.getInstance();
    
    // Load patterns repository
    try {
      this.locatorManager.loadRepository('patterns');
    } catch (error) {
      // Repository already loaded, ignore error
    }
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

  /**
   * Helper method to get locator from patterns.json
   * Available to all page classes
   * @param templatePath - Complete path to element (e.g., 'loginPage.usernameField', 'OpportunityPage.signup_the_account')
   */
  protected _getLocator(templatePath: string): string {
    try {
      const result = this.locatorManager.buildFromTemplate(templatePath);
      return `xpath=${result.locator}`;
    } catch (error) {
      console.error(`❌ Locator not found: ${templatePath}`, error);
      throw error;
    }
  }

  // Abstract method that child classes must implement
  abstract verifyPageIsLoaded(): Promise<void>;
}


