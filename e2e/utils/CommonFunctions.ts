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

  async waitForElementVisible(locator: string, timeout: number = 30000): Promise<void> {
    await this.page.waitForSelector(locator, { state: 'visible', timeout });
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

  /**
   * Select dropdown option by partial text match (case-insensitive)
   * @param locator - Dropdown locator
   * @param partialText - Partial text to match (case-insensitive)
   */
  async selectByContainsText(locator: string, partialText: string): Promise<void> {
    // Clean locator (remove xpath= prefix if present) 
    const cleanLocator = locator.startsWith('xpath=') ? locator.substring(6) : locator;
    
    // Wait for dropdown to be open and options to be visible
    await this.page.waitForTimeout(1000);
    
    // Get all lightning-base-combobox-item options
    const options = await this.page.locator('lightning-base-combobox-item').all();
    
    let matchedOption = null;
    for (const option of options) {
      const optionText = await option.textContent();
      if (optionText && optionText.toLowerCase().includes(partialText.toLowerCase())) {
        matchedOption = option;
        const displayText = optionText.trim();
        console.log(`✅ Found matching option: "${displayText}" for search: "${partialText}"`);
        break;
      }
    }
    
    if (matchedOption) {
      await matchedOption.click();
      console.log(`✅ Selected Lightning dropdown option`);
    } else {
      const allOptions = await this.page.locator('lightning-base-combobox-item').allTextContents();
      console.error(`❌ No Lightning option found containing: "${partialText}"`);
      console.error(`Available options: ${JSON.stringify(allOptions)}`);
      throw new Error(`Lightning option containing '${partialText}' not found. Available: ${allOptions.join(', ')}`);
    }
  }

  /**
   * Select dropdown option by exact text match (case-insensitive)
   * @param locator - Dropdown locator
   * @param optionText - Text to match (case-insensitive)
   */
  async selectByTextIgnoreCase(locator: string, optionText: string): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout: 10000 });
    
    // Get all options from the dropdown
    const options = await this.page.locator(`${locator} option`).all();
    
    let matchedOption = null;
    for (const option of options) {
      const optionTextContent = await option.textContent();
      if (optionTextContent && optionTextContent.toLowerCase().trim() === optionText.toLowerCase().trim()) {
        matchedOption = optionTextContent.trim();
        console.log(`✅ Found exact match (case-insensitive): "${matchedOption}" for search: "${optionText}"`);
        break;
      }
    }
    
    if (matchedOption) {
      await this.page.locator(locator).selectOption({ label: matchedOption });
      console.log(`✅ Selected option: "${matchedOption}"`);
    } else {
      const allOptions = await this.page.locator(`${locator} option`).allTextContents();
      console.error(`❌ No exact match found for: "${optionText}"`);
      console.error(`Available options: ${JSON.stringify(allOptions)}`);
      throw new Error(`Option '${optionText}' not found (case-insensitive). Available: ${allOptions.join(', ')}`);
    }
  }

  async selectByValue(locator: string, value: string): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(locator).selectOption({ value });
  }

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================


  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForTimeout(timeout: number): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  // =============================================================================
  // IFRAME METHODS - For working with Object Repository in iframes
  // =============================================================================

  /**
   * Fill form field inside iframe using object repository locator with scroll
   */
  async switchFrame_Fill_fields(frame: any, repoLocator: string, value: string, timeout: number = 10000): Promise<void> {
    // Extract xpath if it has 'xpath=' prefix
    const cleanLocator = repoLocator.startsWith('xpath=') ? repoLocator.substring(6) : repoLocator;
    
    await frame.waitForSelector(cleanLocator, { state: 'visible', timeout });
    await this.scrollToFrameElement(frame, repoLocator);
    await frame.fill(cleanLocator, value);
  }

  /**
   * Click element inside iframe using object repository locator (with fresh frame reference)
   */
  async switchFrame_click(repoLocator: string, timeout: number = 10000): Promise<void> {
    // Get fresh frame reference each time to avoid detachment issues
    const freshFrame = this.page.frameLocator('iframe').first();
    const cleanLocator = repoLocator.startsWith('xpath=') ? repoLocator.substring(6) : repoLocator;
    
    
    try {
      // Wait for element to be visible before clicking
      await freshFrame.locator(cleanLocator).waitFor({ state: 'visible', timeout });
      await freshFrame.locator(cleanLocator).scrollIntoViewIfNeeded();
      await freshFrame.locator(cleanLocator).click({ timeout });
    } catch (error) {
      console.log(`⚠️ switchFrame_click failed for locator: ${cleanLocator}`, error);
      throw error;
    }
  }

  /**
   * Click element inside iframe using provided frame reference (for consistency)
   */
  async switchFrame_click_withFrame(frame: any, repoLocator: string, timeout: number = 10000): Promise<void> {
    const cleanLocator = repoLocator.startsWith('xpath=') ? repoLocator.substring(6) : repoLocator;
    
    try {
      await frame.waitForSelector(cleanLocator, { state: 'visible', timeout });
      await frame.locator(cleanLocator).click({ timeout });
    } catch (error) {
      console.log(`⚠️ switchFrame_click_withFrame failed for locator: ${cleanLocator}`, error);
      throw error;
    }
  }
  
  /**
   * Simple iframe click method with scroll
   */
  async frameClick(locator: string): Promise<void> {
    const cleanLocator = locator.startsWith('xpath=') ? locator.substring(6) : locator;
    const frameLocator = this.page.frameLocator('iframe').first();
    await frameLocator.locator(cleanLocator).scrollIntoViewIfNeeded();
    await frameLocator.locator(cleanLocator).click();
  }

  /**
   * Simple iframe fill method with scroll
   */
  async frameFill(locator: string, value: string): Promise<void> {
    const cleanLocator = locator.startsWith('xpath=') ? locator.substring(6) : locator;
    const frameLocator = this.page.frameLocator('iframe').first();
    await frameLocator.locator(cleanLocator).scrollIntoViewIfNeeded();
    await frameLocator.locator(cleanLocator).fill(value);
  }

  /**
   * Simple main page click method with scroll
   */
  async click(locator: string): Promise<void> {
    const cleanLocator = locator.startsWith('xpath=') ? locator.substring(6) : locator;
    await this.scrollToElement(locator);
    await this.page.locator(cleanLocator).click();
  }

  /**
   * Scroll to element on main page
   */
  async scrollToElement(locator: string): Promise<void> {
    const cleanLocator = locator.startsWith('xpath=') ? locator.substring(6) : locator;
    await this.page.locator(cleanLocator).scrollIntoViewIfNeeded();
  }

  /**
   * Scroll to element inside iframe
   */
  async scrollToFrameElement(frame: any, locator: string): Promise<void> {
    const cleanLocator = locator.startsWith('xpath=') ? locator.substring(6) : locator;
    await frame.locator(cleanLocator).scrollIntoViewIfNeeded();
  }

  /**
   * Scroll to element in iframe using fresh frame reference (standalone method)
   */
  async scrollToIframeElement(locator: string): Promise<void> {
    const cleanLocator = locator.startsWith('xpath=') ? locator.substring(6) : locator;
    const frameLocator = this.page.frameLocator('iframe').first();
    await frameLocator.locator(cleanLocator).scrollIntoViewIfNeeded();
  }

  /**
   * Simple main page fill method with scroll
   */
  async fill(locator: string, value: string): Promise<void> {
    const cleanLocator = locator.startsWith('xpath=') ? locator.substring(6) : locator;
    await this.scrollToElement(locator);
    await this.page.locator(cleanLocator).fill(value);
  }

  /**
   * Wait for element to be visible inside iframe
   */
  async waitForFrameElementVisible(frame: any, repoLocator: string, timeout: number = 30000): Promise<void> {
    const cleanLocator = repoLocator.startsWith('xpath=') ? repoLocator.substring(6) : repoLocator;
    await frame.waitForSelector(cleanLocator, { state: 'visible', timeout });
  }

  /**
   * Fill using frameLocator with object repository
   */
  async safeFrameLocatorFill(frameLocator: any, repoLocator: string, value: string): Promise<void> {
    const cleanLocator = repoLocator.startsWith('xpath=') ? repoLocator.substring(6) : repoLocator;
    
    await frameLocator.locator(cleanLocator).waitFor({ state: 'visible' });
    await frameLocator.locator(cleanLocator).fill(value);
    console.log(`✅ FrameLocator filled ${cleanLocator} with: ${value}`);
  }

  /**
   * Click using frameLocator with object repository
   */
  async safeFrameLocatorClick(frameLocator: any, repoLocator: string): Promise<void> {
    const cleanLocator = repoLocator.startsWith('xpath=') ? repoLocator.substring(6) : repoLocator;
    
    await frameLocator.locator(cleanLocator).waitFor({ state: 'visible' });
    await frameLocator.locator(cleanLocator).click();
    console.log(`✅ FrameLocator clicked: ${cleanLocator}`);
  }

  /**
   * Toggle Methods for Salesforce Lightning Toggles
   */
  async toggleOn(locator: string): Promise<void> {
    const cleanLocator = locator.startsWith('xpath=') ? locator.substring(6) : locator;
    await this.scrollToElement(locator);
    
    await this.page.locator(cleanLocator).waitFor({ state: 'visible', timeout: 10000 });
    
    const isChecked = await this.page.locator(cleanLocator).isChecked();
    if (!isChecked) {
      await this.page.locator(cleanLocator).click();
      console.log(`✅ Toggle turned ON`);
    } else {
      console.log(`✅ Toggle was already ON`);
    }
  }

  async toggleOff(locator: string): Promise<void> {
    const cleanLocator = locator.startsWith('xpath=') ? locator.substring(6) : locator;
    await this.scrollToElement(locator);
    
    await this.page.locator(cleanLocator).waitFor({ state: 'visible', timeout: 10000 });
    
    const isChecked = await this.page.locator(cleanLocator).isChecked();
    if (isChecked) {
      await this.page.locator(cleanLocator).click();
      console.log(`✅ Toggle turned OFF`);
    } else {
      console.log(`✅ Toggle was already OFF`);
    }
  }

  async toggleState(locator: string, state: boolean): Promise<void> {
    if (state) {
      await this.toggleOn(locator);
    } else {
      await this.toggleOff(locator);
    }
  }

  async getToggleState(locator: string): Promise<boolean> {
    const cleanLocator = locator.startsWith('xpath=') ? locator.substring(6) : locator;
    await this.page.locator(cleanLocator).waitFor({ state: 'visible', timeout: 10000 });
    return await this.page.locator(cleanLocator).isChecked();
  }

  /**
   * Calendar Date Selection Method for Salesforce Lightning
   */
  async selectTodayPlusDays(calendarButtonLocator: string, days: number): Promise<void> {
    // Calculate target date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log(`🗓️ Selecting date: ${targetDateString} (${days} days from today)`);
    
    // Click calendar button to open picker
    await this.click(calendarButtonLocator);
    await this.page.waitForTimeout(1000);
    
    // Navigate to correct month/year if needed
    await this.navigateToTargetMonth(targetDate);
    
    // Click the specific date
    const dateLocator = `//td[@data-value='${targetDateString}' and @aria-disabled='false']`;
    await this.page.locator(dateLocator).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(dateLocator).click();
    
    console.log(`✅ Selected date: ${targetDateString}`);
  }

  private async navigateToTargetMonth(targetDate: Date): Promise<void> {
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth(); // 0-based (0 = January)
    
    // Set year first if different
    const yearDropdown = this.page.locator('//select[@part="select"]');
    await yearDropdown.selectOption(targetYear.toString());
    await this.page.waitForTimeout(500);
    
    // Navigate to correct month
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const targetMonthName = monthNames[targetMonth];
    console.log(`📅 Navigating to: ${targetMonthName} ${targetYear}`);
    
    // Navigate months using next/previous buttons
    let attempts = 0;
    while (attempts < 12) {
      const currentTitle = await this.page.locator('//h2[contains(@id,"month-title")]').textContent();
      if (currentTitle?.trim() === targetMonthName) {
        console.log(`✅ Reached target month: ${targetMonthName}`);
        break;
      }
      
      // Click next month button
      await this.page.locator('//button[@title="Next Month"]').click();
      await this.page.waitForTimeout(300);
      attempts++;
    }
  }
}
