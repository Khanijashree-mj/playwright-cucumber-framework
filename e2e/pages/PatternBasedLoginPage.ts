import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { DynamicLocatorManager, LocatorBuildResult } from "../objectRepository/managers/DynamicLocatorManager";

export class PatternBasedLoginPage extends BasePage {
  private locatorManager: DynamicLocatorManager;
  private readonly repositoryFile = 'patterns';

  constructor(page: Page) {
    super(page);
    this.locatorManager = DynamicLocatorManager.getInstance();
    
    // Load the pattern repository
    try {
      this.locatorManager.loadRepository(this.repositoryFile);
      console.log('✅ Pattern-based login page initialized');
    } catch (error) {
      console.error('❌ Failed to initialize pattern repository:', error);
      throw error;
    }
  }

  // Override abstract method from BasePage
  async verifyPageIsLoaded(): Promise<void> {
    const title = await this.getPageTitle();
    expect(title).toContain("Test Login");
  }

  // =============================================================================
  // NAVIGATION METHODS
  // =============================================================================

  async navigateToLoginPage(): Promise<void> {
    await this.page.goto("https://practicetestautomation.com/practice-test-login");
    await this.waitForPageLoad();
  }

  // =============================================================================
  // TEMPLATE-BASED METHODS (Primary Approach)
  // =============================================================================

  /**
   * Enter username using template with fallback support
   */
  async enterUsername(username: string): Promise<void> {
    const locatorResult = this.locatorManager.buildFromTemplate('loginPage.usernameField');
    
    try {
      const element = this.page.locator(`xpath=${locatorResult.locator}`);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.clear();
      await element.fill(username);
      
      console.log(`✅ Username entered using: ${locatorResult.patternUsed}${locatorResult.fallbackUsed ? ' (fallback)' : ''}`);
    } catch (error) {
      console.error(`❌ Failed to enter username:`, error);
      throw new Error(`Failed to enter username using pattern: ${locatorResult.patternUsed}`);
    }
  }

  /**
   * Enter password using template with fallback support
   */
  async enterPassword(password: string): Promise<void> {
    const locatorResult = this.locatorManager.buildFromTemplate('loginPage.passwordField');
    
    try {
      const element = this.page.locator(`xpath=${locatorResult.locator}`);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.clear();
      await element.fill(password);
      
      console.log(`✅ Password entered using: ${locatorResult.patternUsed}${locatorResult.fallbackUsed ? ' (fallback)' : ''}`);
    } catch (error) {
      console.error(`❌ Failed to enter password:`, error);
      throw new Error(`Failed to enter password using pattern: ${locatorResult.patternUsed}`);
    }
  }

  /**
   * Click login button using template with fallback support
   */
  async clickLoginButton(): Promise<void> {
    const locatorResult = this.locatorManager.buildFromTemplate('loginPage.loginButton');
    
    try {
      const element = this.page.locator(`xpath=${locatorResult.locator}`);
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.click();
      
      console.log(`✅ Login button clicked using: ${locatorResult.patternUsed}${locatorResult.fallbackUsed ? ' (fallback)' : ''}`);
    } catch (error) {
      console.error(`❌ Failed to click login button:`, error);
      throw new Error(`Failed to click login button using pattern: ${locatorResult.patternUsed}`);
    }
  }

  // =============================================================================
  // PATTERN-BASED METHODS (Alternative Approach)
  // =============================================================================

  /**
   * Enter any form field using dynamic patterns
   */
  async enterFormField(fieldName: string, value: string, inputType: 'name' | 'id' | 'placeholder' = 'name'): Promise<void> {
    let locatorResult: LocatorBuildResult;
    
    switch (inputType) {
      case 'name':
        locatorResult = this.locatorManager.buildLocator('basic.inputByName', { name: fieldName });
        break;
      case 'id':
        locatorResult = this.locatorManager.buildLocator('basic.inputById', { id: fieldName });
        break;
      case 'placeholder':
        locatorResult = this.locatorManager.buildLocator('basic.inputByPlaceholder', { placeholder: fieldName });
        break;
    }

    const element = this.page.locator(`xpath=${locatorResult.locator}`);
    await element.waitFor({ state: 'visible', timeout: 10000 });
    await element.fill(value);
    
    console.log(`✅ Field '${fieldName}' filled using pattern: ${locatorResult.patternUsed}`);
  }

  /**
   * Click any button using dynamic patterns
   */
  async clickButtonByText(buttonText: string): Promise<void> {
    const locatorResult = this.locatorManager.buildLocator('basic.buttonByText', { text: buttonText });
    
    const element = this.page.locator(`xpath=${locatorResult.locator}`);
    await element.waitFor({ state: 'visible', timeout: 10000 });
    await element.click();
    
    console.log(`✅ Button '${buttonText}' clicked using pattern: ${locatorResult.patternUsed}`);
  }

  /**
   * Click any link using dynamic patterns
   */
  async clickLinkByText(linkText: string): Promise<void> {
    const locatorResult = this.locatorManager.buildLocator('basic.linkByText', { text: linkText });
    
    const element = this.page.locator(`xpath=${locatorResult.locator}`);
    await element.waitFor({ state: 'visible', timeout: 10000 });
    await element.click();
    
    console.log(`✅ Link '${linkText}' clicked using pattern: ${locatorResult.patternUsed}`);
  }

  // =============================================================================
  // STATIC ELEMENT METHODS
  // =============================================================================

  /**
   * Verify success message using static element
   */
  async verifySuccessfulLogin(): Promise<void> {
    const locatorResult = this.locatorManager.getStaticElement('login.successMessage');
    
    const element = this.page.locator(`xpath=${locatorResult.locator}`);
    await element.waitFor({ state: 'visible', timeout: 15000 });
    const isVisible = await element.isVisible();
    expect(isVisible).toBe(true);
    
    console.log(`✅ Success message verified using: ${locatorResult.patternUsed}`);
  }

  /**
   * Verify login failed using static element
   */
  async verifyLoginFailed(): Promise<void> {
    const locatorResult = this.locatorManager.getStaticElement('login.errorMessage');
    
    const element = this.page.locator(`xpath=${locatorResult.locator}`);
    await element.waitFor({ state: 'visible', timeout: 10000 });
    const isVisible = await element.isVisible();
    expect(isVisible).toBe(true);
    
    console.log(`✅ Error message verified using: ${locatorResult.patternUsed}`);
  }

  // =============================================================================
  // COMPLEX PATTERN METHODS
  // =============================================================================

  /**
   * Verify specific error messages using complex patterns
   */
  async verifyUsernameRequiredError(): Promise<void> {
    await this.verifyErrorByText('username');
  }

  async verifyPasswordRequiredError(): Promise<void> {
    await this.verifyErrorByText('password');
  }

  async verifyBothFieldsRequiredError(): Promise<void> {
    await this.verifyErrorByText('invalid');
  }

  private async verifyErrorByText(expectedText: string): Promise<void> {
    const locatorResult = this.locatorManager.buildComplexLocator(
      'textBasedElements.partialTextMatch', 
      { text: expectedText }
    );
    
    const element = this.page.locator(`xpath=${locatorResult.locator}`);
    await element.waitFor({ state: 'visible', timeout: 10000 });
    const isVisible = await element.isVisible();
    expect(isVisible).toBe(true);
    
    console.log(`✅ Error message verified using complex pattern: ${locatorResult.patternUsed}`);
  }

  // =============================================================================
  // DATA-DRIVEN METHODS
  // =============================================================================

  /**
   * Fill multiple form fields using data-driven approach
   */
  async fillFormFields(fieldData: Array<{ name: string; value: string; type?: 'name' | 'id' | 'placeholder' }>): Promise<void> {
    console.log(`🔄 Filling ${fieldData.length} form fields using dynamic patterns...`);
    
    for (const field of fieldData) {
      await this.enterFormField(field.name, field.value, field.type || 'name');
    }
    
    console.log(`✅ All ${fieldData.length} form fields filled successfully`);
  }

  /**
   * Verify multiple elements exist using pattern matching
   */
  async verifyElementsExist(elementChecks: Array<{ pattern: string; params: Record<string, string> }>): Promise<void> {
    console.log(`🔍 Verifying ${elementChecks.length} elements exist...`);
    
    const results = this.locatorManager.buildMultipleLocators(
      elementChecks[0].pattern,
      elementChecks.map(check => check.params)
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const element = this.page.locator(`xpath=${result.locator}`);
      
      try {
        await element.waitFor({ state: 'visible', timeout: 5000 });
        console.log(`✅ Element verified: ${result.description}`);
      } catch (error) {
        console.error(`❌ Element not found: ${result.description}`);
        throw error;
      }
    }
  }

  // =============================================================================
  // UTILITY AND DEBUG METHODS
  // =============================================================================

  /**
   * Get repository statistics for debugging
   */
  getRepositoryStats(): any {
    return this.locatorManager.getRepositoryStats();
  }

  /**
   * Validate the repository
   */
  validateRepository(): any {
    return this.locatorManager.validateRepository();
  }

  /**
   * Search for patterns containing specific text
   */
  searchPatterns(searchText: string): Array<{ path: string; pattern: string; category: string }> {
    return this.locatorManager.searchPatterns(searchText);
  }

  /**
   * Clear the pattern cache
   */
  clearPatternCache(): void {
    this.locatorManager.clearCache();
    console.log('🧹 Pattern cache cleared');
  }

  /**
   * Log current pattern cache statistics
   */
  logCacheStats(): void {
    const stats = this.getRepositoryStats();
    console.log('📊 Pattern Cache Stats:', stats.cacheStats);
  }

  // =============================================================================
  // ADVANCED USAGE EXAMPLES
  // =============================================================================

  /**
   * Example: Complex login scenario with fallback handling
   */
  async performCompleteLoginWithFallbacks(username: string, password: string): Promise<void> {
    console.log('🚀 Starting complete login with automatic fallback handling...');
    
    try {
      // Navigate and verify page load
      await this.navigateToLoginPage();
      await this.verifyPageIsLoaded();
      
      // Fill credentials using templates (with automatic fallbacks)
      await this.enterUsername(username);
      await this.enterPassword(password);
      await this.clickLoginButton();
      
      // Wait a moment for response
      await this.page.waitForTimeout(2000);
      
      // Verify outcome (try success first, then error)
      try {
        await this.verifySuccessfulLogin();
        console.log('✅ Login successful!');
      } catch {
        await this.verifyLoginFailed();
        console.log('⚠️ Login failed as expected');
      }
      
    } catch (error) {
      console.error('❌ Complete login scenario failed:', error);
      throw error;
    }
  }

  /**
   * Example: Data-driven form filling
   */
  async performDataDrivenLogin(testData: { username: string; password: string }): Promise<void> {
    console.log('📊 Performing data-driven login...');
    
    const formFields = [
      { name: 'username', value: testData.username, type: 'name' as const },
      { name: 'password', value: testData.password, type: 'name' as const }
    ];
    
    await this.navigateToLoginPage();
    await this.fillFormFields(formFields);
    await this.clickButtonByText('Submit');
    
    console.log('✅ Data-driven login completed');
  }
}
