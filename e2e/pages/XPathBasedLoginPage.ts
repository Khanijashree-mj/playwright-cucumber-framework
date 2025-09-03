import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { XPathRepositoryManager } from "../objectRepository/managers/XPathRepository";

export class XPathBasedLoginPage extends BasePage {
  private xpathRepo: XPathRepositoryManager;
  private readonly repositoryName = 'loginPage';

  constructor(page: Page) {
    super(page);
    this.xpathRepo = XPathRepositoryManager.getInstance();
  }

  // Override abstract method from BasePage
  async verifyPageIsLoaded(): Promise<void> {
    const pageConfig = this.xpathRepo.getPageConfig(this.repositoryName);
    const title = await this.getPageTitle();
    expect(title).toContain(pageConfig.title);
  }

  // Navigate to login page using repository URL
  async navigateToLoginPage(): Promise<void> {
    const pageConfig = this.xpathRepo.getPageConfig(this.repositoryName);
    await this.page.goto(pageConfig.url);
    await this.page.waitForLoadState("networkidle");
  }

  // Enter username using XPath from repository
  async enterUsername(username: string): Promise<void> {
    const xpath = this.xpathRepo.getXPath(this.repositoryName, 'usernameInput');
    const element = this.page.locator(`xpath=${xpath}`);
    
    try {
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.clear();
      await element.fill(username);
    } catch (error) {
      // Try alternate XPath if primary fails
      const alternateXpath = this.xpathRepo.getAlternateXPath(this.repositoryName, 'usernameInput');
      const alternateElement = this.page.locator(`xpath=${alternateXpath}`);
      await alternateElement.waitFor({ state: 'visible', timeout: 5000 });
      await alternateElement.clear();
      await alternateElement.fill(username);
    }
  }

  // Enter password using XPath from repository
  async enterPassword(password: string): Promise<void> {
    const xpath = this.xpathRepo.getXPath(this.repositoryName, 'passwordInput');
    const element = this.page.locator(`xpath=${xpath}`);
    
    try {
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.clear();
      await element.fill(password);
    } catch (error) {
      // Try alternate XPath if primary fails
      const alternateXpath = this.xpathRepo.getAlternateXPath(this.repositoryName, 'passwordInput');
      const alternateElement = this.page.locator(`xpath=${alternateXpath}`);
      await alternateElement.waitFor({ state: 'visible', timeout: 5000 });
      await alternateElement.clear();
      await alternateElement.fill(password);
    }
  }

  // Click login button using XPath from repository
  async clickLoginButton(): Promise<void> {
    const xpath = this.xpathRepo.getXPath(this.repositoryName, 'loginButton');
    const element = this.page.locator(`xpath=${xpath}`);
    
    try {
      await element.waitFor({ state: 'visible', timeout: 10000 });
      await element.click();
    } catch (error) {
      // Try alternate XPath if primary fails
      const alternateXpath = this.xpathRepo.getAlternateXPath(this.repositoryName, 'loginButton');
      const alternateElement = this.page.locator(`xpath=${alternateXpath}`);
      await alternateElement.waitFor({ state: 'visible', timeout: 5000 });
      await alternateElement.click();
    }
  }

  // Verify successful login using XPath from repository
  async verifySuccessfulLogin(): Promise<void> {
    const xpath = this.xpathRepo.getXPath(this.repositoryName, 'successMessage');
    const element = this.page.locator(`xpath=${xpath}`);
    
    await element.waitFor({ state: 'visible', timeout: 15000 });
    const isVisible = await element.isVisible();
    expect(isVisible).toBe(true);
  }

  // Verify login failed using XPath from repository
  async verifyLoginFailed(): Promise<void> {
    const xpath = this.xpathRepo.getXPath(this.repositoryName, 'errorMessage');
    const element = this.page.locator(`xpath=${xpath}`);
    
    await element.waitFor({ state: 'visible', timeout: 10000 });
    const isVisible = await element.isVisible();
    expect(isVisible).toBe(true);
  }

  // Verify specific error messages using repository data
  async verifyUsernameRequiredError(): Promise<void> {
    await this.verifySpecificError('usernameRequired');
  }

  async verifyPasswordRequiredError(): Promise<void> {
    await this.verifySpecificError('passwordRequired');
  }

  async verifyBothFieldsRequiredError(): Promise<void> {
    await this.verifySpecificError('bothRequired');
  }

  // Private helper method to verify specific error messages
  private async verifySpecificError(errorType: string): Promise<void> {
    const xpath = this.xpathRepo.getXPath(this.repositoryName, 'errorMessage');
    const expectedMessage = this.xpathRepo.getErrorMessage(this.repositoryName, errorType);
    
    const element = this.page.locator(`xpath=${xpath}`);
    await element.waitFor({ state: 'visible', timeout: 10000 });
    
    const actualMessage = await element.textContent();
    expect(actualMessage?.trim()).toContain(expectedMessage);
  }

  // Example of using dynamic XPath patterns
  async clickDynamicButton(buttonText: string): Promise<void> {
    const xpath = this.xpathRepo.getDynamicXPath(
      this.repositoryName, 
      'buttonByText', 
      { text: buttonText }
    );
    
    const element = this.page.locator(`xpath=${xpath}`);
    await element.waitFor({ state: 'visible', timeout: 10000 });
    await element.click();
  }

  // Example of using dynamic XPath for links
  async clickDynamicLink(linkText: string): Promise<void> {
    const xpath = this.xpathRepo.getDynamicXPath(
      this.repositoryName, 
      'linkByText', 
      { text: linkText }
    );
    
    const element = this.page.locator(`xpath=${xpath}`);
    await element.waitFor({ state: 'visible', timeout: 10000 });
    await element.click();
  }

  // Utility method to get element description for logging
  async getElementDescription(elementName: string): string {
    const elementData = this.xpathRepo.getElement(this.repositoryName, elementName);
    return elementData.description;
  }

  // Utility method to validate page elements exist
  async validatePageElements(): Promise<boolean> {
    const requiredElements = ['usernameInput', 'passwordInput', 'loginButton'];
    return this.xpathRepo.validateElements(this.repositoryName, requiredElements);
  }
}
