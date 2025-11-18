import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * OpportunityPage - Basic structure for Opportunity page operations
 * Inherits _getLocator() method from BasePage
 */
export class OpportunityPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    /**
     * Required by BasePage - Verify that the Opportunity page has loaded
     */
    async verifyPageIsLoaded(): Promise<void> {
        console.log('🔍 Verifying Opportunity page is loaded...');
        await this.page.waitForLoadState('domcontentloaded');
        console.log('✅ Opportunity page loaded');
    }

    // Add your Opportunity-specific methods here as needed
    
    async signup_the_account(): Promise<void> {
        console.log('🔍 Signup the account...');
        await this.page.locator(this._getLocator('OpportunityPage.signup_the_account')).click();
        console.log('✅ Signup the account');
    }
}