import { Page } from "@playwright/test";
import { LoginPage } from "./LoginPage";

export class PageManager {
  private page: Page;
  private loginPage?: LoginPage;

  constructor(page: Page) {
    this.page = page;
  }

  // Lazy initialization of page objects
  getLoginPage(): LoginPage {
    if (!this.loginPage) {
      this.loginPage = new LoginPage(this.page);
    }
    return this.loginPage;
  }

  // You can add more page objects here as you expand your tests
  // getDashboardPage(): DashboardPage { ... }
  // getProfilePage(): ProfilePage { ... }
}
