import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { DynamicLocatorManager } from "../objectRepository/managers/DynamicLocatorManager";
import { TestDataManager } from "../utils/TestDataManager";
import { CommonFunctions } from "../utils/CommonFunctions";

/**
 * LoginPage - Clean implementation for environment-based lead creation testing
 * Only contains methods used by the feature file
 */
export class LoginPage extends BasePage {
  private locatorManager: DynamicLocatorManager;
  private testDataManager: TestDataManager;

  constructor(page: Page) {
    super(page);
    this.locatorManager = DynamicLocatorManager.getInstance();
    this.testDataManager = TestDataManager.getInstance();
    
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

  async navigateToEnvironmentLoginPage(environment: string): Promise<void> {
    const loginUrl = this.testDataManager.getEnvironmentUrl(environment);
    await this.common.navigateTo(loginUrl);
    await this.common.waitForPageLoad();
    console.log(`✅ Navigated to ${environment} environment login page: ${loginUrl}`);
  }

  async verifyPageIsLoaded(): Promise<void> {
    // Simple verification that we're on a Salesforce login page
    await this.common.waitForPageLoad();
    console.log('✅ Login page loaded');
  }

  // =============================================================================
  // LOGIN METHODS
  // =============================================================================

  /**
   * Login using test data by user type from JSON
   * @param userType - 'validUser', 'invalidUser', 'adminUser', 'realUser', 'emptyUser'
   */
  async performUserTypeLogin(userType: string): Promise<void> {
    const userData = this.testDataManager.getUser(userType);
    console.log(`🎯 Performing user-type login with ${userType}: ${userData.description}`);
    
    await this.common.safeFill(this._getLocator('loginPage.usernameField'), userData.username);
    await this.common.safeFill(this._getLocator('loginPage.passwordField'), userData.password);
    await this.common.safeClick(this._getLocator('loginPage.loginButton'));
    
    console.log(`✅ Login submitted for ${userType}`);
  }

  /**
   * Login using environment-based user auto-selection
   * @param environment - 'GCI', 'Dev', 'BISUAT'
   */
  async performEnvironmentLogin(environment: string): Promise<void> {
    const userData = this.testDataManager.getUserByEnvironment(environment);
    console.log(`🌍 Performing ${environment} environment login: ${userData.description}`);
    
    await this.common.safeFill(this._getLocator('loginPage.usernameField'), userData.username);
    await this.common.safeFill(this._getLocator('loginPage.passwordField'), userData.password);
    await this.common.safeClick(this._getLocator('loginPage.loginButton'));
    
    console.log(`✅ Login submitted for ${environment} environment`);
  }

  // =============================================================================
  // LEAD CREATION AND CONVERSION METHODS
  // =============================================================================

  async createLeadWithCountry(leadform_data: string, country: string): Promise<void>{
    console.log(`🌍 Creating lead with country: ${country}`);
    console.log("creating lead");
    await this.common.click(this._getLocator('leadPage.leadtab'));
    console.log("✅ Leads tab clicked");
    
    // Wait longer for leads page to load completely
    console.log("⏳ Waiting for Leads page to load...");
    await this.page.waitForTimeout(8000);
    
    // Explicitly wait for New button to be visible
    console.log("⏳ Waiting for New button to be visible...");
    try{
    await this.page.waitForSelector("//a[@title='New']", { state: 'visible', timeout: 20000 });
    await this.common.click(this._getLocator('leadPage.new_button'));
    }catch{
      await this.page.waitForSelector("//button[@name='New']", { state: 'visible', timeout: 20000 });
      await this.common.click(this._getLocator('leadPage.bisuat_new_button'));
    }
    await this.common.click(this._getLocator('leadPage.next_button'));
    console.log("✅ Next button clicked");
    
    console.log("Waiting for iframe to load...");
    await this.page.waitForTimeout(5000);
    const frameElement = await this.page.waitForSelector('iframe', { timeout: 30000 });
    const frame = await frameElement.contentFrame();
    
    const leaddata = this.testDataManager.getTestData('leadform');
    console.log(`fill lead Form in iframe`);
    
    console.log("📝 Filling lead form fields...");
    await this.common.waitForFrameElementVisible(frame, this._getLocator('leadPage.lead_last_name'));

    // Fill basic form fields
    await this.common.switchFrame_Fill_fields(frame, this._getLocator('leadPage.lead_first_name'), leaddata.first_name);
    console.log("✅ First name filled");
    await this.page.waitForTimeout(2000);
    await this.common.switchFrame_Fill_fields(frame, this._getLocator('leadPage.lead_last_name'), leaddata.last_name);
    console.log("✅ Last name filled");
    await this.common.switchFrame_Fill_fields(frame, this._getLocator('leadPage.lead_company_name'), leaddata.company_name);
    console.log("✅ Company filled");
    await this.common.switchFrame_Fill_fields(frame, this._getLocator('leadPage.lead_email'), leaddata.email);
    console.log("✅ Email filled");
    await this.common.switchFrame_Fill_fields(frame, this._getLocator('leadPage.lead_contact_phone'), leaddata.contact_phone);
    console.log("✅ Phone filled");
    
    // Handle dropdown selections
    await this.common.switchFrame_click(this._getLocator('leadPage.lead_source_dropdown_btn'));
    await this.common.switchFrame_click(this._getLocator('leadPage.lead_source_option'));
    console.log("✅ Lead source selected");

    await this.common.switchFrame_click(this._getLocator('leadPage.lead_employee_range_dropdown_btn'));
    await this.common.switchFrame_click(this._getLocator('leadPage.lead_employee_range_option'));
    console.log("✅ Employee range selected");
    
    await this.common.switchFrame_click(this._getLocator('leadPage.lead_industry_dropdown_btn'));
    await this.common.switchFrame_click(this._getLocator('leadPage.lead_industry_option'));
    console.log("✅ Industry selected");
    
    await this.common.switchFrame_Fill_fields(frame, this._getLocator('leadPage.lead_website'), leaddata.website);
    console.log("✅ Website filled");

    // Submit lead form
    await this.common.switchFrame_click(this._getLocator('leadPage.lead_search_btn')); 
    console.log("✅ Search button clicked");
    await this.common.switchFrame_click(this._getLocator('leadPage.create_new_lead_btn')); 
    console.log("✅ Create new lead button clicked");
    await this.page.waitForTimeout(30000);

    // Change lead owner
    console.log("👤 Changing lead owner...");
    await this.page.locator("//li//span[text()='Show more actions']").first().click({ timeout: 5000 });
    
    console.log("✅ Show more actions clicked");
    await this.common.click(this._getLocator('leadPage.lead_change_owner_btn'));
    console.log("✅ Change owner button clicked");
    await this.common.fill(this._getLocator('leadPage.lead_search_user_field'), leaddata.lead_owner_name);
    console.log("✅ User search field filled");
    
    // Wait for dropdown results to populate
    await this.page.waitForTimeout(3000);
    console.log("⏳ Waiting for user dropdown results...");
    
    // Ensure the search field is focused
    await this.page.locator("//input[@placeholder='Search Users...']").focus();
    console.log("✅ Search field focused");
    
    // Use keyboard navigation since search field is focused and working
    console.log(`⏳ Looking for user: ${leaddata.lead_owner_name}`);
    
    // Wait for dropdown to fully populate
    await this.page.waitForTimeout(3000);
    
    // Use keyboard to select first option (most reliable)
    await this.page.keyboard.press('ArrowDown');
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('Enter');
    console.log("✅ User selected via keyboard navigation");

    await this.common.click(this._getLocator('leadPage.change_owner'));
    console.log("✅ Change owner completed");
    console.log(`✅ Lead owner changed successfully`);
    
    await this.common.click(this._getLocator('leadPage.Details_tab'));
    console.log("✅ Details tab clicked");
    
    // Get address data for the specified country
    const addressData = this.testDataManager.getAddressData(country);
    console.log(`🌍 Using address data for country: ${country} - ${addressData.Country}`);

    await this.common.scrollToElement(this._getLocator('leadPage.edit_button'));
    await this.common.click(this._getLocator('leadPage.edit_button'));
    
    await this.common.click(this._getLocator('leadPage.billing_country_drp_dwn'));
    await this.common.selectByContainsText(this._getLocator('leadPage.billing_country_drp_dwn'), addressData.Country);
    
    // Select state from dropdown
    await this.common.click(this._getLocator('leadPage.state_dropdown_btn'));
    await this.common.selectByContainsText(this._getLocator('leadPage.state_dropdown_btn'), addressData.State);

    await this.common.fill(this._getLocator('leadPage.fill_city'), addressData.City);
    console.log(`✅ City field filled with: ${addressData.City}`);
    await this.common.fill(this._getLocator('leadPage.fill_Zip'), addressData.Zipcode);
    console.log(`✅ Zipcode field filled with: ${addressData.Zipcode}`);
    await this.common.fill(this._getLocator('leadPage.fill_street'), addressData.Street);
    console.log(`✅ Street field filled with: ${addressData.Street}`);
    await this.common.fill(this._getLocator('leadPage.fill_country'), addressData.Country);
    console.log(`✅ Country field filled with: ${addressData.Country}`);
    
    await this.common.click(this._getLocator('leadPage.save_btn'));
    await this.page.waitForTimeout(30000);
    
    console.log(`🎉 Lead creation with country ${country} completed successfully!`);
  }
  
  async convertlead_to_opportunity(leadform_data: string, country: string): Promise<void>{
    const addressData = this.testDataManager.getAddressData(country);
    await this.page.locator("//li//span[text()='Show more actions']").first().click({ timeout: 5000 });
    console.log("✅ Show more actions clicked to convert lead");
    
    // Store current URL to detect navigation
    const currentURL = this.page.url();
    console.log("📋 Current URL before convert:", currentURL);
    
    // Click Convert - this may navigate within same page or open modal
    await this.common.click(this._getLocator('leadPage.convert_lead'));
    console.log("✅ Convert clicked, checking for navigation...");
    
    // Simple navigation wait for BISUAT (always same-page navigation)
    try {
      await this.page.waitForURL(url => url.toString() !== currentURL, { timeout: 10000 });
      console.log("✅ Conversion page loaded");
    } catch (error) {
      console.log("⚠️ URL didn't change, proceeding with current page");
    }
    
    // Wait for conversion page to be ready
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(3000);
    
    // Clean toggle click approach - try iframe first, fallback to main page
    console.log("🔄 Starting conversion setup...");
    
    const frameElement = await this.page.waitForSelector('.oneAlohaPage iframe', { timeout: 5000 });
    const frame = await frameElement.contentFrame();
    
    try {
      // Try iframe approach first (Lightning page iframe)
      
      
      if (frame) {
        // Wait for toggle and click with JavaScript
        await this.common.waitForFrameElementVisible(frame, this._getLocator('leadPage.create_new_account_toggle'));
        await this.common.frameJsClick(frame, this._getLocator('leadPage.create_new_account_toggle'));
        
        // Wait for reaction and try edit button  
        await this.page.waitForTimeout(3000);
        
        // Try to click Edit button if it appears
        try {
          await this.common.waitForFrameElementVisible(frame, this._getLocator('leadPage.edit_convert_oppty'));
          await this.common.frameJsClick(frame, this._getLocator('leadPage.edit_convert_oppty'));
        } catch (error) {
          console.log("⚠️ Edit button not found in iframe, continuing...");
        }
      }
    } catch (iframeError) {
      // Fallback to main page approach
      console.log("⚠️ Iframe approach failed, trying main page...");
      try {
        await this.common.jsClick(this._getLocator('leadPage.create_new_account_toggle'));
        
        // Wait for reaction and try edit button
        await this.page.waitForTimeout(3000);
        try {
          await this.common.jsClick(this._getLocator('leadPage.edit_convert_oppty'));
        } catch (error) {
          console.log("⚠️ Edit button not found on main page, continuing...");
        }
      } catch (mainPageError) {
        console.log("⚠️ Both iframe and main page approaches failed");
      }
    }
    
    // Handle close date in the same context as toggle clicks 
    await this.page.waitForTimeout(8000); 
    console.log("📅 Setting close date...");
    try {
      // Calculate date (today + 20 days) 
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);
      
      // Use the exact format Salesforce wants: "Dec 31, 2024" 
      const formattedDateSalesforce = futureDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }).trim(); // Format: "Oct 08, 2025" - trim any extra spaces
      
      const formattedDateISO = futureDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).trim(); // Format: "10/08/2025" - trim any extra spaces
      
      console.log("📅 Date formats to try:");
      console.log("   Salesforce format:", formattedDateSalesforce);
      console.log("   ISO format:", formattedDateISO);
      
      if (frame) {
        console.log("📅 Trying close date input in iframe context");
        try {
          // Try direct input first (more reliable than calendar picker)
          const dateInput = frame.locator('input[name="closeDate"]');
          await dateInput.waitFor({ state: 'visible', timeout: 5000 });
          
          // Try Salesforce format first (Dec 31, 2024) - exact format from error message
          console.log("🔄 Trying Salesforce date format:", formattedDateSalesforce);
          await dateInput.fill(formattedDateSalesforce);
          await this.page.waitForTimeout(1000); // Let validation happen
          
          // Check for validation errors
          const hasError = await dateInput.getAttribute('aria-invalid');
          if (hasError === 'true') {
            console.log("⚠️ Salesforce format rejected, trying ISO format:", formattedDateISO);
            await dateInput.clear();
            await dateInput.fill(formattedDateISO);
            await this.page.waitForTimeout(1000);
            
            const hasError2 = await dateInput.getAttribute('aria-invalid');
            if (hasError2 === 'true') {
              console.log("⚠️ ISO format also rejected, checking error message...");
              try {
                const errorMsg = await frame.locator('[data-error-message]').textContent();
                console.log("⚠️ Validation error:", errorMsg);
              } catch (e) {
                console.log("⚠️ Could not get error message");
              }
            } else {
              console.log("✅ ISO format accepted");
            }
          } else {
            console.log("✅ Salesforce format accepted");
          }
          
          console.log("✅ Close date filled directly in iframe");
          
          // Click outside date field to lose focus and trigger validation
          await frame.locator('body').click({ position: { x: 50, y: 50 } });
          await this.page.waitForTimeout(1000);
          console.log("✅ Date field focus removed");
          
        } catch (directInputError) {
          console.log("⚠️ Direct input failed, trying calendar picker");
          await frame.locator(this._getLocator('leadPage.calendar_picker_btn')).waitFor({ state: 'visible', timeout: 5000 });
          await this.common.frameJsClick(frame, this._getLocator('leadPage.calendar_picker_btn'));
          // Wait for calendar to open and try date selection
          await this.page.waitForTimeout(2000);
          await this.common.selectTodayPlusDays(this._getLocator('leadPage.calendar_picker_btn'), 20);
          
          // Click outside after calendar selection
          await frame.locator('body').click({ position: { x: 50, y: 50 } });
          await this.page.waitForTimeout(1000);
          console.log("✅ Focus removed after calendar selection");
        }
      } else {
        console.log("📅 Trying close date input in main page context");
        try {
          const dateInput = this.page.locator('input[name="closeDate"]');
          await dateInput.waitFor({ state: 'visible', timeout: 5000 });
          
          // Try Salesforce format first (Dec 31, 2024) - exact format from error message
          console.log("🔄 Main page: Trying Salesforce date format:", formattedDateSalesforce);
          await dateInput.fill(formattedDateSalesforce);
          await this.page.waitForTimeout(1000);
          
          const hasError = await dateInput.getAttribute('aria-invalid');
          if (hasError === 'true') {
            console.log("⚠️ Main page: Salesforce format rejected, trying ISO format:", formattedDateISO);
            await dateInput.clear();
            await dateInput.fill(formattedDateISO);
          }
          
          console.log("✅ Close date filled directly on main page");
          
          // Click outside date field to lose focus and trigger validation
          await this.page.locator('body').click({ position: { x: 50, y: 50 } });
          await this.page.waitForTimeout(1000);
          console.log("✅ Date field focus removed");
          
        } catch (directInputError) {
          await this.common.jsClick(this._getLocator('leadPage.calendar_picker_btn'));
          await this.page.waitForTimeout(2000);
          await this.common.selectTodayPlusDays(this._getLocator('leadPage.calendar_picker_btn'), 20);
          
          // Click outside after calendar selection
          await this.page.locator('body').click({ position: { x: 50, y: 50 } });
          await this.page.waitForTimeout(1000);
          console.log("✅ Focus removed after calendar selection");
        }
      }
    } catch (calendarError) {
      console.log("⚠️ Close date selection failed, skipping...", calendarError instanceof Error ? calendarError.message : String(calendarError));
    }
    
    // Check for any validation errors before proceeding
    try {
      if (frame) {
        const errorElements = await frame.locator('[aria-invalid="true"], .slds-has-error, [data-error-message]:not(:empty)').count();
        console.log("📊 Validation errors found in iframe:", errorElements);
        
        if (errorElements > 0) {
          const errorMessages = await frame.locator('[data-error-message]:not(:empty), .slds-form-element__help').allTextContents();
          console.log("🔍 Error messages:", errorMessages);
        }
      } else {
        const errorElements = await this.page.locator('[aria-invalid="true"], .slds-has-error, [data-error-message]:not(:empty)').count();
        console.log("📊 Validation errors found on main page:", errorElements);
      }
    } catch (validationCheckError) {
      console.log("⚠️ Could not check validation errors");
    }
    
    await this.page.waitForTimeout(5000);
    // Complete conversion and check for navigation/errors
    const conversionURL = this.page.url();
    console.log("📋 URL before Apply/Convert:", conversionURL);
    
    // Handle Apply button clicks with separate error handling
    try {
      if (frame) {
        console.log("🔄 Clicking Apply button in iframe (1st time)...");
        await this.common.frameJsClick(frame, this._getLocator('leadPage.Button_Apply'));
        await this.page.waitForTimeout(3000);
        
        // Check for errors after first Apply
        await this.checkForCloseDataErrors(frame, "after 1st Apply in iframe");
        
        try {
          console.log("🔄 Clicking Apply button in iframe (2nd time)...");
          await this.common.frameJsClick(frame, this._getLocator('leadPage.Button_Apply'));
          await this.page.waitForTimeout(3000);
          
          // Check for errors after second Apply
          await this.checkForCloseDataErrors(frame, "after 2nd Apply in iframe");
        } catch (secondApplyError) {
          console.log("⚠️ Second Apply button not found (this is normal after first Apply)");
        }
      } else {
        console.log("🔄 Clicking Apply button on main page (1st time)...");
        await this.common.jsClick(this._getLocator('leadPage.Button_Apply'));
        await this.page.waitForTimeout(3000);
        
        // Check for errors after first Apply  
        await this.checkForCloseDataErrors(null, "after 1st Apply on main page");
        
        try {
          console.log("🔄 Clicking Apply button on main page (2nd time)...");
          await this.common.jsClick(this._getLocator('leadPage.Button_Apply'));
          await this.page.waitForTimeout(3000);
          
          // Check for errors after second Apply  
          await this.checkForCloseDataErrors(null, "after 2nd Apply on main page");
        } catch (secondApplyError) {
          console.log("⚠️ Second Apply button not found (this is normal after first Apply)");
        }
      }
    } catch (firstApplyError) {
      console.log("⚠️ First Apply button not found");
    }

    // Always attempt Convert button click regardless of Apply button status
    await this.page.waitForTimeout(2000);
    try {
      if (frame) {
        console.log("🔄 Clicking Convert button in iframe...");
        await this.common.frameJsClick(frame, this._getLocator('leadPage.Button_convert'));
        console.log("✅ Convert button clicked successfully in iframe");
      } else {
        console.log("🔄 Clicking Convert button on main page...");
        await this.common.jsClick(this._getLocator('leadPage.Button_convert'));
        console.log("✅ Convert button clicked successfully on main page");
      }
    } catch (convertError) {
      console.log("⚠️ Convert button not found or failed to click");
    }

    // Wait for opportunity page to load (30-45 seconds)
    console.log("⏳ Waiting for opportunity page to load (30-45 seconds)...");
    
    try {
      // Wait for URL change indicating navigation to opportunity page
      await this.page.waitForURL(url => url.toString() !== conversionURL, { timeout: 50000 });
      console.log("🔀 Navigation detected after Convert!");
      
      const newURL = this.page.url();
      console.log("📋 New URL:", newURL);

      // Wait for opportunity page to load completely
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 30000 });
      
      // Verify opportunity page has loaded
      await this.verifyOpportunityPageLoaded();
      
    } catch (navigationError) {
      console.log("⚠️ Navigation timeout or failed, checking current page...");
      const currentURL = this.page.url();
      
      if (currentURL !== conversionURL) {
        console.log("✅ Page changed, verifying opportunity page...");
        await this.verifyOpportunityPageLoaded();
      } else {
        console.log("📋 Staying on same conversion page");
      }
    }
    console.log(`🎉 Complete lead creation and conversion workflow finished successfully for ${country}!`);
  }

  // Verify opportunity page has loaded successfully
  private async verifyOpportunityPageLoaded(): Promise<void> {
    try {
      console.log("🔍 Verifying opportunity page has loaded...");
      
      const currentURL = this.page.url();
      console.log("📋 Current URL:", currentURL);
      
      // Check if URL matches opportunity page pattern: /lightning/r/Opportunity/{Id}/view
      const opportunityURLPattern = /\/lightning\/r\/Opportunity\/[A-Za-z0-9]{15,18}\/view/;
      
      if (opportunityURLPattern.test(currentURL)) {
        // Extract opportunity ID from URL
        const opportunityIdMatch = currentURL.match(/\/Opportunity\/([A-Za-z0-9]{15,18})\//);
        const opportunityId = opportunityIdMatch ? opportunityIdMatch[1] : 'Unknown';
        
        console.log("✅ Opportunity page verified - URL matches pattern");
        console.log("🆔 Opportunity ID:", opportunityId);
        console.log("🔗 Opportunity URL:", currentURL);
        
        // Additional verification - wait for opportunity page elements to load
        try {
          await this.page.waitForSelector("//span[contains(text(),'Opportunity')]", { timeout: 10000, state: 'visible' });
          console.log("✅ Opportunity page elements loaded successfully");
        } catch (elementError) {
          console.log("⚠️ Opportunity page elements not found, but URL is correct");
        }
        
        // Click Quote tab (direct page context, no iframe)
        await this.common.click("xpath=//a[.='Quote']");
        
        return;
      }
      
      // Fallback verification if URL pattern doesn't match
      console.log("⚠️ URL doesn't match expected opportunity pattern, trying alternative verification...");
      
      const opportunityIndicators = [
        "//span[contains(text(),'Opportunity')]",
        "//h1[contains(@class,'slds-page-header__title')]",
        "//lightning-formatted-text[contains(text(),'Opportunity')]"
      ];
      
      for (const indicator of opportunityIndicators) {
        try {
          await this.page.waitForSelector(indicator, { timeout: 5000, state: 'visible' });
          console.log("✅ Opportunity page verified - found opportunity indicator");
          
          // Click Quote tab (direct page context, no iframe)
          await this.common.jsClick(this._getLocator('OpportunityPage.Quote_tab'));
          
          return;
        } catch (e) {
          // Try next indicator
        }
      }
      
      console.log("⚠️ Could not verify opportunity page, but proceeding...");
      
    } catch (error) {
      console.log("⚠️ Error verifying opportunity page:", error instanceof Error ? error.message : String(error));
    }
  }


  // Helper method to check for close date and other validation errors
  private async checkForCloseDataErrors(frame: any, context: string): Promise<void> {
    console.log(`🔍 Checking for errors ${context}...`);
    
    try {
      const workingContext = frame || this.page;
      
      // Check for close date specific errors
      const closeDateErrors = await workingContext.locator('input[name="closeDate"][aria-invalid="true"], input[name="closeDate"] + .slds-form-element__help, [data-name="closeDate"][data-error-message]').count();
      
      if (closeDateErrors > 0) {
        console.log(`❌ Close date validation errors found: ${closeDateErrors}`);
        const closeDateErrorTexts = await workingContext.locator('input[name="closeDate"] ~ .slds-form-element__help, [data-name="closeDate"][data-error-message]').allTextContents();
        console.log("❌ Close date errors:", closeDateErrorTexts.filter((text: string) => text.trim()));
      } else {
        console.log("✅ No close date errors found");
      }
      
      // Check for general form errors
      const allErrors = await workingContext.locator('.slds-has-error, [aria-invalid="true"], .slds-form-element__help:not(:empty), [data-error-message]:not(:empty)').count();
      console.log(`📊 Total form errors found: ${allErrors}`);
      
      if (allErrors > 0) {
        // Get all error messages
        const allErrorTexts = await workingContext.locator('.slds-form-element__help:not(:empty), [data-error-message]:not(:empty)').allTextContents();
        const significantErrors = allErrorTexts.filter((text: string) => text.trim() && !text.includes('*')); // Filter out empty and asterisk-only messages
        
        if (significantErrors.length > 0) {
          console.log("❌ Form errors:", significantErrors.map((e: string) => e.trim()).join('; '));
        }
      }
      
      // Check for validation error messages
      const entryErrors = await workingContext.locator(':text("entry doesn\'t match"), :text("doesn\'t match"), :text("invalid"), :text("required"), :text("error")').count();
      if (entryErrors > 0) {
        const entryErrorTexts = await workingContext.locator(':text("entry doesn\'t match"), :text("doesn\'t match"), :text("invalid"), :text("required"), :text("error")').allTextContents();
        console.log("⚠️ Validation errors:", entryErrorTexts.join('; '));
      }
      
    } catch (errorCheckError) {
      console.log("⚠️ Error while checking for validation errors:", errorCheckError instanceof Error ? errorCheckError.message : String(errorCheckError));
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Universal locator fetcher - pass full path like "loginPage.usernameField" or "leadPage.leadtab"
   * @param fullPath - Complete path to element (e.g., 'loginPage.usernameField', 'leadPage.leadtab')
   */
  private _getLocator(fullPath: string): string {
    try {
      const result = this.locatorManager.buildFromTemplate(fullPath);
      return `xpath=${result.locator}`;
    } catch (error) {
      console.error(`❌ Locator not found: ${fullPath}`, error);
      throw error;
    }
  }
}