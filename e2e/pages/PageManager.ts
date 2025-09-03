import { Page } from "@playwright/test";
import { PatternBasedLoginPage } from "./PatternBasedLoginPage";

export class PageManager {
  private page: Page;
  private patternBasedLoginPage?: PatternBasedLoginPage;

  constructor(page: Page) {
    this.page = page;
  }

  // Lazy initialization of pattern-based page objects
  getLoginPage(): PatternBasedLoginPage {
    if (!this.patternBasedLoginPage) {
      this.patternBasedLoginPage = new PatternBasedLoginPage(this.page);
    }
    return this.patternBasedLoginPage;
  }

  // Pattern-based approach for all page objects
  getPatternBasedLoginPage(): PatternBasedLoginPage {
    return this.getLoginPage();
  }

  // You can add more pattern-based page objects here as you expand your tests
  // getPatternBasedDashboardPage(): PatternBasedDashboardPage { ... }
  // getPatternBasedProfilePage(): PatternBasedProfilePage { ... }
}
