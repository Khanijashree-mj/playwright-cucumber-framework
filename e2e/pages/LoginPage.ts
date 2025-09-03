import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {

  // Page elements (locators)
  private readonly usernameInput = () => this.page.getByLabel("Username");
  private readonly passwordInput = () => this.page.getByLabel("Password");
  private readonly loginButton = () => this.page.getByRole("button", { name: "Submit" });
  private readonly successHeading = () => this.page.getByRole("heading", { name: "Logged In Successfully" });
  private readonly errorMessage = () => this.page.locator("#error");

  constructor(page: Page) {
    super(page);
  }

  // Abstract methods for step definitions
  async navigateToLoginPage(): Promise<void> {
    await this.page.goto("https://practicetestautomation.com/practice-test-login");
  }

  async verifyPageIsLoaded(): Promise<void> {
    const title = await this.getPageTitle();
    expect(title).toContain("Test Login");
  }

  async verifyLoginPageIsLoaded(): Promise<void> {
    await this.verifyPageIsLoaded();
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput().fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput().fill(password);
  }

  async clickLoginButton(): Promise<void> {
    await this.loginButton().click();
  }

  async verifySuccessfulLogin(): Promise<void> {
    const isVisible = await this.successHeading().isVisible();
    expect(isVisible).toBe(true);
  }

  async verifyLoginFailed(): Promise<void> {
    const isVisible = await this.errorMessage().isVisible();
    expect(isVisible).toBe(true);
  }

  async verifyUsernameRequiredError(): Promise<void> {
    const isVisible = await this.errorMessage().isVisible();
    expect(isVisible).toBe(true);
    // You can add more specific error message validation here
  }

  async verifyPasswordRequiredError(): Promise<void> {
    const isVisible = await this.errorMessage().isVisible();
    expect(isVisible).toBe(true);
    // You can add more specific error message validation here
  }

  async verifyBothFieldsRequiredError(): Promise<void> {
    const isVisible = await this.errorMessage().isVisible();
    expect(isVisible).toBe(true);
    // You can add more specific error message validation here
  }

  // Helper methods (if needed)
  async clearAllFields(): Promise<void> {
    await this.usernameInput().clear();
    await this.passwordInput().clear();
  }
}
