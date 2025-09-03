import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { DynamicLocatorManager } from "../objectRepository/managers/DynamicLocatorManager";

/**
 * LoginPage - Simple implementation using Pattern-Based Object Repository + CommonFunctions
 * Extends BasePage for common functionality, step definitions just call these methods
 */
export class LoginPage extends BasePage {
  private locatorManager: DynamicLocatorManager;

  constructor(page: Page) {
    super(page);
    this.locatorManager = DynamicLocatorManager.getInstance();
    
    // Load patterns repository
    try {
      this.locatorManager.loadRepository('patterns');
    } catch (error) {
      console.log('Pattern repository already loaded or error loading:', error);
    }
  }

  // =============================================================================
  // NAVIGATION METHODS
  // =============================================================================

  async navigateToLoginPage(): Promise<void> {
    await this.common.navigateTo("https://practicetestautomation.com/practice-test-login");
    await this.common.waitForPageLoad();
    console.log('✅ Navigated to login page');
  }

  async verifyPageIsLoaded(): Promise<void> {
    await this.common.assertTitle(/Test Login/, 'Login page should be loaded');
    console.log('✅ Login page loaded');
  }

  async verifyLoginPageLoaded(): Promise<void> {
    await this.verifyPageIsLoaded();
  }

  // =============================================================================
  // LOGIN METHODS
  // =============================================================================

  async performLogin(username: string, password: string): Promise<void> {
    console.log(`🔐 Performing login for user: ${username}`);
    
    // Get locators using pattern-based repo
    const usernameLocator = this._getPatternLocator('loginPage.usernameField');
    const passwordLocator = this._getPatternLocator('loginPage.passwordField');
    const loginButtonLocator = this._getPatternLocator('loginPage.loginButton');
    
    // Fill form using common functions
    await this.common.safeFill(usernameLocator, username);
    await this.common.safeFill(passwordLocator, password);
    await this.common.safeClick(loginButtonLocator);
    
    console.log('✅ Login form submitted');
  }

  async performLoginWithPatterns(username: string, password: string): Promise<void> {
    console.log(`🔐 Performing pattern-based login for user: ${username}`);
    
    // Use dynamic patterns instead of templates
    const usernameResult = this.locatorManager.buildLocator('basic.inputByName', { name: 'username' });
    const passwordResult = this.locatorManager.buildLocator('basic.inputByName', { name: 'password' });
    const buttonResult = this.locatorManager.buildLocator('basic.buttonByText', { text: 'Submit' });
    
    await this.common.safeFill(`xpath=${usernameResult.locator}`, username);
    await this.common.safeFill(`xpath=${passwordResult.locator}`, password);
    await this.common.safeClick(`xpath=${buttonResult.locator}`);
    
    console.log('✅ Pattern-based login submitted');
  }

  async performKeyboardLogin(username: string, password: string): Promise<void> {
    console.log(`⌨️ Performing keyboard login for user: ${username}`);
    
    const usernameLocator = this._getPatternLocator('loginPage.usernameField');
    const passwordLocator = this._getPatternLocator('loginPage.passwordField');
    
    // Click username field and type
    await this.common.safeClick(usernameLocator);
    await this.common.safeType(usernameLocator, username);
    
    // Tab to password field
    await this.common.pressKey('Tab');
    await this.common.safeType(passwordLocator, password);
    
    // Submit with Enter
    await this.common.pressKey('Enter');
    
    console.log('✅ Keyboard login submitted');
  }

  async performDataDrivenLogin(loginData: Record<string, string>): Promise<void> {
    console.log('📊 Performing data-driven login');
    
    for (const [field, value] of Object.entries(loginData)) {
      if (field === 'username') {
        const locator = this._getPatternLocator('loginPage.usernameField');
        await this.common.safeFill(locator, value);
      } else if (field === 'password') {
        const locator = this._getPatternLocator('loginPage.passwordField');
        await this.common.safeFill(locator, value);
      }
    }
    
    const loginButtonLocator = this._getPatternLocator('loginPage.loginButton');
    await this.common.safeClick(loginButtonLocator);
    
    console.log('✅ Data-driven login submitted');
  }

  // =============================================================================
  // VERIFICATION METHODS
  // =============================================================================

  async verifyLoginSuccess(): Promise<void> {
    console.log('🔍 Verifying login success');
    
    // Wait for navigation to success page
    await this.common.waitForUrlContains('logged-in-successfully');
    
    // Verify success message using pattern
    const successLocator = this._getPatternLocator('loginPage.successMessage');
    await this.common.assertVisible(successLocator, 'Success message should be visible');
    await this.common.assertText(successLocator, 'Logged In Successfully', 'Success message should contain correct text');
    
    // Verify logout button is present
    const logoutLocator = this._getPatternLocator('loginPage.logoutButton');
    await this.common.assertVisible(logoutLocator, 'Logout button should be visible');
    
    console.log('✅ Login success verified');
  }

  async verifyLoginError(errorType: string): Promise<void> {
    console.log(`🔍 Verifying login error: ${errorType}`);
    
    const errorLocator = this._getPatternLocator('loginPage.errorMessage');
    await this.common.waitForVisible(errorLocator, 10000);
    
    switch (errorType) {
      case 'invalid-credentials':
        await this.common.assertText(errorLocator, 'Your username is invalid!', 'Should show invalid username error');
        break;
      case 'username-required':
        await this.common.assertText(errorLocator, 'Your username is invalid!', 'Should show username required error');
        break;
      case 'password-required':
        await this.common.assertText(errorLocator, 'Your password is invalid!', 'Should show password required error');
        break;
      default:
        await this.common.assertVisible(errorLocator, 'Error message should be visible');
    }
    
    console.log(`✅ Login error '${errorType}' verified`);
  }

  async verifyLoginFormEmpty(): Promise<void> {
    console.log('🔍 Verifying login form is empty');
    
    const usernameLocator = this._getPatternLocator('loginPage.usernameField');
    const passwordLocator = this._getPatternLocator('loginPage.passwordField');
    
    const usernameValue = await this.common.getInputValue(usernameLocator);
    const passwordValue = await this.common.getInputValue(passwordLocator);
    
    if (usernameValue !== '' || passwordValue !== '') {
      throw new Error(`Login form is not empty. Username: '${usernameValue}', Password: '${passwordValue}'`);
    }
    
    console.log('✅ Login form is empty');
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  async clearLoginForm(): Promise<void> {
    console.log('🧹 Clearing login form');
    
    const usernameLocator = this._getPatternLocator('loginPage.usernameField');
    const passwordLocator = this._getPatternLocator('loginPage.passwordField');
    
    await this.common.safeFill(usernameLocator, '', true);
    await this.common.safeFill(passwordLocator, '', true);
    
    console.log('✅ Login form cleared');
  }

  async takeLoginPageScreenshot(filename: string): Promise<void> {
    await this.common.takeScreenshot(filename);
    console.log(`📸 Login page screenshot taken: ${filename}`);
  }

  async performLogout(): Promise<void> {
    console.log('🚪 Performing logout');
    
    const logoutLocator = this._getPatternLocator('loginPage.logoutButton');
    await this.common.safeClick(logoutLocator);
    
    // Wait for navigation back to login page
    await this.common.waitForPageLoad();
    await this.common.waitForUrlContains('practice-test-login');
    
    console.log('✅ Logout completed');
  }

  async validateLoginFormAccessibility(): Promise<void> {
    console.log('♿ Validating login form accessibility');
    
    const usernameLocator = this._getPatternLocator('loginPage.usernameField');
    const passwordLocator = this._getPatternLocator('loginPage.passwordField');
    const loginButtonLocator = this._getPatternLocator('loginPage.loginButton');
    
    // Check form elements have proper attributes
    const usernameType = await this.common.getAttribute(usernameLocator, 'type');
    const passwordType = await this.common.getAttribute(passwordLocator, 'type');
    const buttonType = await this.common.getAttribute(loginButtonLocator, 'type');
    
    if (usernameType !== 'text' && usernameType !== null) {
      console.warn('⚠️ Username field type might not be optimal for accessibility');
    }
    if (passwordType !== 'password') {
      console.warn('⚠️ Password field should have type="password"');
    }
    if (buttonType !== 'submit') {
      console.warn('⚠️ Login button should have type="submit"');
    }
    
    console.log('✅ Login form accessibility validated');
  }

  // =============================================================================
  // COMPLEX WORKFLOWS
  // =============================================================================

  async executeCompleteLoginWorkflow(username: string, password: string, shouldSucceed: boolean = true): Promise<void> {
    console.log(`🚀 Executing complete login workflow for: ${username}`);
    
    // Step 1: Navigate and verify
    await this.navigateToLoginPage();
    await this.verifyLoginPageLoaded();
    await this.takeLoginPageScreenshot('login-initial');
    
    // Step 2: Perform login
    await this.performLogin(username, password);
    await this.common.waitForPageLoad();
    
    // Step 3: Verify result
    if (shouldSucceed) {
      await this.verifyLoginSuccess();
      await this.takeLoginPageScreenshot('login-success');
    } else {
      await this.verifyLoginError('invalid-credentials');
      await this.takeLoginPageScreenshot('login-error');
    }
    
    console.log(`✅ Complete login workflow ${shouldSucceed ? 'success' : 'error'} completed`);
  }

  async executeMultipleLoginTests(testCases: Array<{
    username: string;
    password: string;
    shouldSucceed: boolean;
    description: string;
  }>): Promise<void> {
    console.log(`📊 Executing ${testCases.length} login test cases`);
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n🧪 Test ${i + 1}/${testCases.length}: ${testCase.description}`);
      
      try {
        await this.executeCompleteLoginWorkflow(
          testCase.username, 
          testCase.password, 
          testCase.shouldSucceed
        );
        
        // Navigate back to login page if not the last test
        if (i < testCases.length - 1) {
          if (testCase.shouldSucceed) {
            await this.performLogout();
          }
          await this.navigateToLoginPage();
        }
        
      } catch (error) {
        console.error(`❌ Test case failed: ${testCase.description}`, error);
        throw error;
      }
    }
    
    console.log('🎉 All login test cases completed');
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private _getPatternLocator(templatePath: string): string {
    const result = this.locatorManager.buildFromTemplate(templatePath);
    return `xpath=${result.locator}`;
  }

  private async _verifyElement(templatePath: string, message: string): Promise<void> {
    const locator = this._getPatternLocator(templatePath);
    await this.common.assertVisible(locator, message);
  }

  // =============================================================================
  // DEBUG METHODS
  // =============================================================================

  async debugCurrentState(): Promise<void> {
    const url = await this.common.getCurrentUrl();
    const title = await this.common.getPageTitle();
    
    console.log('🐛 Current Page State:');
    console.log(`   📍 URL: ${url}`);
    console.log(`   📄 Title: ${title}`);
    
    // Check if login form elements are visible
    const usernameVisible = await this.common.isVisible(this._getPatternLocator('loginPage.usernameField'));
    const passwordVisible = await this.common.isVisible(this._getPatternLocator('loginPage.passwordField'));
    const buttonVisible = await this.common.isVisible(this._getPatternLocator('loginPage.loginButton'));
    
    console.log(`   👁️  Username field visible: ${usernameVisible}`);
    console.log(`   👁️  Password field visible: ${passwordVisible}`);
    console.log(`   👁️  Login button visible: ${buttonVisible}`);
  }
}
