import { Page, Locator, expect } from "@playwright/test";

/**
 * Common Playwright Functions - Reusable utilities
 * Call these functions from any implementation file
 */
export class CommonFunctions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // =============================================================================
  // NAVIGATION FUNCTIONS
  // =============================================================================

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async refreshPage(): Promise<void> {
    await this.page.reload({ waitUntil: 'networkidle' });
  }

  // =============================================================================
  // WAIT FUNCTIONS
  // =============================================================================

  async waitForVisible(locator: string, timeout: number = 10000): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout });
  }

  async waitForHidden(locator: string, timeout: number = 10000): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'hidden', timeout });
  }

  async waitForUrlContains(urlPart: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForURL(url => url.toString().includes(urlPart), { timeout });
  }

  // =============================================================================
  // INTERACTION FUNCTIONS
  // =============================================================================

  async safeClick(locator: string, retries: number = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.page.locator(locator).waitFor({ state: 'visible', timeout: 10000 });
        await this.page.locator(locator).click();
        return;
      } catch (error) {
        if (attempt === retries) {
          throw new Error(`Failed to click ${locator} after ${retries} attempts: ${error}`);
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  async safeFill(locator: string, value: string, clearFirst: boolean = true): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout: 10000 });
    if (clearFirst) {
      await this.page.locator(locator).clear();
    }
    await this.page.locator(locator).fill(value);
  }

  async safeType(locator: string, text: string, delay: number = 50): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(locator).type(text, { delay });
  }

  async hover(locator: string): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(locator).hover();
  }

  // =============================================================================
  // VALIDATION FUNCTIONS
  // =============================================================================

  async isVisible(locator: string): Promise<boolean> {
    try {
      await this.page.locator(locator).waitFor({ state: 'visible', timeout: 5000 });
      return await this.page.locator(locator).isVisible();
    } catch {
      return false;
    }
  }

  async isEnabled(locator: string): Promise<boolean> {
    return await this.page.locator(locator).isEnabled();
  }

  async getText(locator: string): Promise<string | null> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout: 10000 });
    return await this.page.locator(locator).textContent();
  }

  async getInputValue(locator: string): Promise<string> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout: 10000 });
    return await this.page.locator(locator).inputValue();
  }

  async getAttribute(locator: string, attributeName: string): Promise<string | null> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout: 10000 });
    return await this.page.locator(locator).getAttribute(attributeName);
  }

  async getElementCount(locator: string): Promise<number> {
    return await this.page.locator(locator).count();
  }

  // =============================================================================
  // ASSERTION FUNCTIONS
  // =============================================================================

  async assertVisible(locator: string, message?: string): Promise<void> {
    await expect(this.page.locator(locator), message).toBeVisible();
  }

  async assertHidden(locator: string, message?: string): Promise<void> {
    await expect(this.page.locator(locator), message).toBeHidden();
  }

  async assertText(locator: string, expectedText: string, message?: string): Promise<void> {
    await expect(this.page.locator(locator), message).toContainText(expectedText);
  }

  async assertExactText(locator: string, expectedText: string, message?: string): Promise<void> {
    await expect(this.page.locator(locator), message).toHaveText(expectedText);
  }

  async assertUrl(expectedUrl: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message).toHaveURL(expectedUrl);
  }

  async assertTitle(expectedTitle: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message).toHaveTitle(expectedTitle);
  }

  // =============================================================================
  // SCREENSHOT FUNCTIONS
  // =============================================================================

  async takeScreenshot(filename: string): Promise<void> {
    await this.page.screenshot({ 
      path: `./test-results/screenshots/${filename}.png`,
      fullPage: true 
    });
  }

  async takeElementScreenshot(locator: string, filename: string): Promise<void> {
    await this.page.locator(locator).screenshot({ 
      path: `./test-results/screenshots/${filename}.png` 
    });
  }

  // =============================================================================
  // KEYBOARD FUNCTIONS
  // =============================================================================

  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async pressKeys(keys: string[]): Promise<void> {
    for (const key of keys.slice(0, -1)) {
      await this.page.keyboard.down(key);
    }
    await this.page.keyboard.press(keys[keys.length - 1]);
    for (const key of keys.slice(0, -1).reverse()) {
      await this.page.keyboard.up(key);
    }
  }

  // =============================================================================
  // DROPDOWN FUNCTIONS
  // =============================================================================

  async selectByText(locator: string, optionText: string): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(locator).selectOption({ label: optionText });
  }

  async selectByValue(locator: string, value: string): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(locator).selectOption({ value });
  }

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  async scrollToElement(locator: string): Promise<void> {
    await this.page.locator(locator).scrollIntoViewIfNeeded();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForTimeout(timeout: number): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }
}
