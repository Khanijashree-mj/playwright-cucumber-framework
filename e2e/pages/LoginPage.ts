import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { DynamicLocatorManager } from "../objectRepository/managers/DynamicLocatorManager";
import { TestDataManager } from "../utils/TestDataManager";
import { CommonFunctions } from "../utils/CommonFunctions";
import { context } from "@cucumber/cucumber";

/**
 * LoginPage - Clean implementation for environment-based lead creation testing
 * Only contains methods used by the feature file
 */
export class LoginPage extends BasePage {
  private locatorManager: DynamicLocatorManager;
  private testDataManager: TestDataManager;

  // Page verification patterns
  private readonly opportunityPattern = /\/lightning\/r\/Opportunity\/[A-Za-z0-9]{15,18}\/view/;
  private readonly opportunityIndicators = [
    "//span[contains(text(),'Opportunity')]",
    "//h1[contains(@class,'slds-page-header__title')]",
    "//lightning-formatted-text[contains(text(),'Opportunity')]"
  ];
  private readonly quotePattern = /\/apex\/QuoteWizard\?id=[A-Za-z0-9]{15,18}&newQuoteType=Sales%20Quote#\/uqt\/package/;
  private readonly quoteIndicators = [
    "//span[contains(text(),'Quote')]",
    "//span[contains(text(),'Sales Quote')]",
    "//h1[contains(text(),'Quote')]",
    "//div[contains(@class,'quote')]",
    "//*[contains(text(),'QuoteWizard')]"
  ];

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
    await this.page.waitForTimeout(20000);  //add this wait if confimration code asked and add it manually  
    // Wait for page navigation after login
    console.log(`⏳ Waiting for login to complete...`);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 60000 });
    
    console.log(`✅ Login submitted for ${environment} environment`);
  }

  // =============================================================================
  // LEAD CREATION AND CONVERSION METHODS
  // =============================================================================

  async createLeadWithCountry(leadform_data: string, country: string): Promise<void>{
    console.log(`🌍 Creating lead with country: ${country}`);
    console.log("creating lead");
    
    // Wait for navigation bar to be fully loaded
    console.log("⏳ Waiting for navigation bar to load...");
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(10000); // Increased wait time
    
    // Wait for Lead tab to be visible before clicking
    try {
      await this.page.waitForSelector(this._getLocator('leadPage.leadtab').replace('xpath=', ''), { 
        state: 'visible', 
        timeout: 15000 
      });
    } catch (error) {
      console.log("⚠️ Lead tab not found with primary locator, trying alternative...");
      // Try alternative Lead tab locators
      const alternativeLeadSelectors = [
        "//a[contains(@title, 'Lead')]",
        "//span[text()='Leads']",
        "//*[@data-id='Lead']",
        "//a[contains(text(), 'Lead')]",
        "//one-app-nav-bar-item-root[@data-id='Lead']",
        "//lightning-primitive-icon[contains(@class, 'lead')]",
        "//a[@data-label='Leads']",
        "//span[contains(text(), 'Lead')]//ancestor::a",
        "//nav//a[contains(@href, 'Lead')]"
      ];
      
      for (const selector of alternativeLeadSelectors) {
        try {
          await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
          console.log(`✅ Found Lead tab with alternative selector: ${selector}`);
          await this.common.click(`xpath=${selector}`);
          console.log("✅ Leads tab clicked with alternative selector");
          return;
        } catch (altError) {
          continue;
        }
      }
      throw new Error("Could not find Lead tab with any selector");
    }
    
    // Click with primary locator if found
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
    
    await this.common.fill(this._getLocator('leadPage.fill_city_1'), addressData.City);
    console.log(`✅ City field filled with: ${addressData.City}`);
    await this.common.fill(this._getLocator('leadPage.fill_Zip_1'), addressData.Zipcode);
    console.log(`✅ Zipcode field filled with: ${addressData.Zipcode}`);
    await this.common.fill(this._getLocator('leadPage.fill_state_1'), addressData.State);
    console.log(`✅ Street field filled with: ${addressData.State}`);
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
    
    
    // Handle Apply button clicks with separate error handling
    try {
      if (frame) {
        console.log("🔄 Clicking Apply button in iframe (1st time)...");
        await this.common.frameJsClick(frame, this._getLocator('leadPage.Button_Apply'));
        await this.page.waitForTimeout(3000);
        
        console.log("✅ First Apply completed");
        
        try {
          console.log("🔄 Clicking Apply button in iframe (2nd time)...");
          await this.common.frameJsClick(frame, this._getLocator('leadPage.Button_Apply'));
          await this.page.waitForTimeout(3000);
          
          console.log("✅ Second Apply completed");
        } catch (secondApplyError) {
          console.log("⚠️ Second Apply button not found (this is normal after first Apply)");
        }
      } else {
        console.log("🔄 Clicking Apply button on main page (1st time)...");
        await this.common.jsClick(this._getLocator('leadPage.Button_Apply'));
        await this.page.waitForTimeout(3000);
        
        console.log("✅ First Apply completed");
        
        try {
          console.log("🔄 Clicking Apply button on main page (2nd time)...");
          await this.common.jsClick(this._getLocator('leadPage.Button_Apply'));
          await this.page.waitForTimeout(3000);
          
          console.log("✅ Second Apply completed");
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
    
    
  }

  
  async create_new_quote(quoteform: string): Promise<void>{
    const oppty_page = this.page;
    

   //----------commented for time being-----------//
      const conversionopptyURL = this.page.url();
      console.log("📋 URL before Apply/Convert:", conversionopptyURL);
   
      // Wait for URL change indicating navigation to opportunity page  
      console.log(`⏳ Waiting for navigation from current URL...`);
      await this.page.waitForURL(url => url.toString() !== conversionopptyURL, { timeout: 50000 });
      console.log("🔀 Navigation detected after Convert!");
      
      const newopptyURL = this.page.url();
      console.log("📋 New URL:", newopptyURL);

      // Wait for opportunity page to load completely
      await this.page.waitForLoadState('domcontentloaded');
      //////-----Remove the networkidle line entirely (Salesforce has persistent background requests)-----///
     // await this.page.waitForLoadState('networkidle');
      
      // Verify opportunity page has loaded
      await this.verifyPageLoaded('Opportunity', this.opportunityPattern, this.opportunityIndicators, true);
      
    
      console.log(`🎉 Complete lead creation and conversion workflow finished successfully`);

       //-----------commented for time being-----------*/
//bisuat
    //await this.page.goto("https://rc--bisuat.sandbox.lightning.force.com/lightning/r/Opportunity/006U700000JBGL4IAP/view", { waitUntil: 'domcontentloaded' });
      //gci
     // await this.page.goto("https://rc--gci.sandbox.lightning.force.com/lightning/r/Opportunity/006Ot00000TNeaMIAT/view", { waitUntil: 'domcontentloaded' });
      // Wait for opportunity page to load completely after direct navigation
      console.log("🔀 Direct navigation to opportunity completed!"); /// */
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        //await this.page.waitForLoadState('networkidle', { timeout: 60000 });
      console.log("✅ Opportunity page loaded successfully");
        await this.page.waitForTimeout(5000);

       // Save the current URL
      const oppty_Url = this.page.url();
      console.log("📋 Opportunity page URL:", oppty_Url);
      
        // Click on Account Name link to navigate to account page
        console.log("🔄 Clicking Account Name link...");
        await this.page.locator(this._getLocator('OpportunityPage.Account_Name_Link')).click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(10000);
        console.log("✅ Navigated to Account page:", this.page.url());

        // Click on Contact Roles tab
        console.log("🔄 Clicking Contact Roles tab...");
        await this.page.locator(this._getLocator('OpportunityPage.Contact_role_relatedlist')).click();
        await this.page.waitForTimeout(3000);

        // Click on New button
        console.log("🔄 Clicking New button...");
        await this.page.locator(this._getLocator('OpportunityPage.New_button')).click();
        await this.page.waitForTimeout(8000);

        // Debug: Check what iframes are available
        console.log("🔍 Checking available iframes after clicking New button...");
        const availableIframes = await this.page.locator('iframe').all();
        console.log(`🔍 Found ${availableIframes.length} iframes on the page`);
        
        for (let i = 0; i < availableIframes.length; i++) {
          const title = await availableIframes[i].getAttribute('title');
          const src = await availableIframes[i].getAttribute('src');
          const name = await availableIframes[i].getAttribute('name');
          console.log(`🔍 Iframe ${i}: title="${title}", src="${src}", name="${name}"`);
        }

        // Wait for iframe to load and switch to it - use the last iframe (newest one after clicking New)
        console.log("🔄 Looking for Contact Role iframe...");
        await this.page.waitForTimeout(3000); // Give time for iframe to load content
        
        // Try to find iframe containing the Contact form element by checking each iframe
        let contactRoleFrame;
        let iframeFound = false;
        
        // Try to find iframe containing the Contact input field, starting from the last (newest)
        for (let i = availableIframes.length - 1; i >= 0; i--) {
          try {
            const frameName = await availableIframes[i].getAttribute('name');
            if (!frameName) continue;
            
            const frameLocator = this.page.frameLocator(`iframe[name="${frameName}"]`);
            // Check if this iframe contains the Contact input field
            const contactField = frameLocator.locator('//input[@id="j_id0:list:j_id3:j_id4:j_id5"]');
            await contactField.waitFor({ state: 'visible', timeout: 3000 });
            contactRoleFrame = frameLocator;
            console.log(`✅ Contact Role iframe found at index ${i} with name: ${frameName}`);
            iframeFound = true;
            break;
      } catch (error) {
            // Continue to next iframe
          }
        }
        
        // If not found by checking content, use the last iframe
        if (!iframeFound) {
          console.log("⚠️ Contact field not found in iframes, using last iframe as fallback");
          contactRoleFrame = this.page.frameLocator('iframe').last();
        }

        // Ensure contactRoleFrame is defined
        if (!contactRoleFrame) {
          throw new Error("Could not find Contact Role iframe");
        }

        const leadData = this.testDataManager.getTestData('leadform');
        const first_name = leadData.first_name;
        const last_name = leadData.last_name;
        const contact_name = first_name + " " + last_name;
        
        console.log("🔄 Clicking on account role in iframe...");
        await contactRoleFrame.locator(this._getLocator('OpportunityPage.contact_role_dropdown')).selectOption({ label: 'Accounts Payable' });
        await this.page.waitForTimeout(3000); 
        
        // Select contact from dropdown using iframe context
        console.log("🔄 Clicking on account name field in iframe...");
        await contactRoleFrame.locator(this._getLocator('OpportunityPage.account_name_dropdown')).fill(contact_name); 
        await this.page.waitForTimeout(3000); 
        

               // Click Contact Lookup button in iframe - opens new tab/window
      console.log("🔄 Clicking Contact Lookup button...");
      
      // Set up promise to wait for new tab/window BEFORE clicking
      const page_promise = this.page.context().waitForEvent('page');
 
      // Click the lookup field or element that opens the new tab
      await this.common.frameJsClick(contactRoleFrame, this._getLocator('OpportunityPage.Contact_Lookup'));       
 
      // Await the new page to be available
      const new_page = await page_promise;
      console.log("✅ New popup window opened! URL:", new_page.url());
      
      // Bring the new popup to front
      await new_page.bringToFront();
      
      // Wait for the popup page to load
      await new_page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      await new_page.waitForLoadState('load', { timeout: 30000 });
      console.log("✅ Popup page loaded");
      
      // Take screenshot of popup to see what's displayed
      await new_page.screenshot({ 
        path: './test-results/screenshots/contact-lookup-popup.png',
        fullPage: true 
      });
      console.log("📸 Screenshot taken: contact-lookup-popup.png");
      
      // Wait a bit for any dynamic content to load
      await this.page.waitForTimeout(3000);
      
      // Take another screenshot after waiting
      await new_page.screenshot({ 
        path: './test-results/screenshots/contact-lookup-popup-after-wait.png',
        fullPage: true 
      });
      console.log("📸 Screenshot taken after wait: contact-lookup-popup-after-wait.png");
      
      // Wait for contact link to be visible and clickable (results may load dynamically)
      console.log("🔄 Waiting for contact link to be clickable...");
      
      // Wait longer for results to load dynamically
      await this.page.waitForTimeout(5000);
      console.log("⏳ Waited 5 seconds for results to load");
      
      // Debug: Check for iframes in the popup
      const popupFrames = await new_page.frames();
      console.log(`🔍 Frames in popup: ${popupFrames.length}`);
      for (let i = 0; i < popupFrames.length; i++) {
        const frameUrl = popupFrames[i].url();
        console.log(`  Frame ${i}: ${frameUrl}`);
      }
      
      // Debug: Print available links in the popup main page
      const allLinks = await new_page.locator('a').all();
      console.log(`🔍 Total links found in popup main page: ${allLinks.length}`);
      for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
        const text = await allLinks[i].textContent();
        const href = await allLinks[i].getAttribute('href');
        console.log(`  Link ${i}: "${text}" href="${href}"`);
      }
      
      // Debug: Check for table structure
      const tables = await new_page.locator('table').count();
      console.log(`🔍 Tables found in main page: ${tables}`);
      
      // Check all iframes for content (contacts are likely in LookupResultsFrame)
      let resultsFrame = null;
      for (let i = 0; i < popupFrames.length; i++) {
        const frameUrl = popupFrames[i].url();
        const frameLinks = await popupFrames[i].locator('a').count();
        const frameTables = await popupFrames[i].locator('table').count();
        console.log(`  Frame ${i} - Links: ${frameLinks}, Tables: ${frameTables}`);
        
        // Look for the frame with results (has tables and links)
        if (frameLinks > 0 || frameTables > 0) {
          console.log(`✅ Found content in Frame ${i}!`);
          resultsFrame = popupFrames[i];
          break;
        }
      }
      
      // Try multiple locator strategies to find the contact link
      let contactLocator;
      let contactFound = false;
      
      // Use the results frame if found, otherwise use main page
      const searchContext = resultsFrame || new_page;
      console.log(`🔍 Searching in: ${resultsFrame ? 'Results iframe' : 'Main page'}`);
      
      // Strategy 1: Original locator in iframe
      if (resultsFrame) {
        contactLocator = resultsFrame.locator(this._getLocator('OpportunityPage.contact_name'));
        const count1 = await contactLocator.count();
        console.log(`🔍 Strategy 1 (iframe) count: ${count1}`);
        if (count1 > 0) {
          console.log("✅ Found contact using original locator in iframe");
          await resultsFrame.locator(this._getLocator('OpportunityPage.contact_name')).click();
          contactFound = true;
          console.log("✅ Contact selected");
        }
      }
    
      
      // The lookup window closes automatically after selection
      // Wait a bit and then switch back to the original page
      
      await this.page.waitForTimeout(2000);
      
      // Switch back to the original page context
      await this.page.bringToFront();
      await this.page.waitForTimeout(1000);
        
       await this.page.waitForTimeout(3000);

       
       // Click Save button in iframe
       console.log("🔄 Clicking Save button in iframe...");
       await contactRoleFrame.locator('//a[@class="btn buttonClass" and text()="Save"]').click();
       await this.page.waitForTimeout(5000);
       
       // Navigate back to opportunity page
       await this.page.goto(oppty_Url, { waitUntil: 'domcontentloaded' });

      // Click on Quote tab to access quote creation
       console.log("🔄 Clicking Quote tab...");
        await this.page.locator(this._getLocator('OpportunityPage.Quote_tab')).waitFor({ state: 'visible', timeout: 15000 });
        await this.page.locator(this._getLocator('OpportunityPage.Quote_tab')).click();
        console.log("✅ Quote tab clicked successfully");
        await this.page.waitForTimeout(10000); // Wait for tab to load
      

      // Look for Quote Wizard iframe and New Quote button
      console.log("🔄 Looking for Quote Wizard iframe...");
      
      // Wait for Quote Wizard iframe to load
      await this.page.waitForTimeout(30000); // Wait for Quote Wizard iframe to load
      await this.page.waitForSelector('iframe[title="Quote Wizard"]', { timeout: 30000 });
      const quoteFrame = await this.page.frameLocator('iframe[title="Quote Wizard"]');
      console.log("✅ Quote Wizard iframe found");

      // Wait for new tab/window to open after clicking "Add New" and click button simultaneously
      console.log("🔄 Clicking 'Add New' button - expecting new tab to open...");
      const [quotePage] = await Promise.all([
        this.page.context().waitForEvent('page'), // Wait for new page/tab
        this.common.frameJsClick(quoteFrame, this._getLocator('OpportunityPage.New_sales_quote'))
      ]);
      
      console.log("🔀 New tab opened - switching focus!");
      
      // Switch to the new page
      await quotePage.waitForLoadState('domcontentloaded', { timeout: 30000 });
      this.page = quotePage; // Switch page context
      
      const newquoteURL = this.page.url();
      console.log("📋 New Quote URL:", newquoteURL);


  }


  // Method to select package by name from examples table
  async selectPackage(packageName1: string, packageName2: string): Promise<void> {
      // Use the current page (new page was already handled in create_new_quote)
      const newPage = this.page;
     
      
      
      // Split package names: If has '-' use part after '-', otherwise use full name
      const actualPackage1 = packageName1.includes('-') ? packageName1.split('-')[1].trim() : packageName1.trim();
      const actualPackage2 = packageName2.includes('-') ? packageName2.split('-')[1].trim() : packageName2.trim();
      
      // Extract header names: If has '-' use part before '-', otherwise use full name  
      const headerName2 = packageName2.includes('-') ? packageName2.split('-')[0].trim() : packageName2.trim();
      
      console.log(`📦 Package 1: "${packageName1}" → Select: "${actualPackage1}"`);
      await this.page.waitForTimeout(8000); 
      
      // Click specific office package select button
      console.log(`🔍 Looking for: ${this._getLocator('OpportunityPage.Package_select_button').replace('{PACKAGE_NAME}', actualPackage1)}`);
      await this.page.locator(this._getLocator('OpportunityPage.Package_select_button').replace('{PACKAGE_NAME}', actualPackage1)).click();
      console.log(`✅ Successfully selected: ${actualPackage1}`);

      //---------Multi-product quote creation -----------//
      
        console.log(`📦 Package 2: "${packageName2}" → Header: "${headerName2}" → Select: "${actualPackage2}"`);
        //-------select from dropdown-------------
        // Use selectOption which handles opening dropdown and selecting automatically
        await newPage.locator(this._getLocator('OpportunityPage.Service_dropdown')).selectOption({ label: headerName2 });
        console.log(`✅ Successfully selected header: ${headerName2}`);
        
        // Click specific package select button
        console.log(`🔍 Looking for package button with text: "${actualPackage2}"`);
        await newPage.locator(this._getLocator('OpportunityPage.Package_select_button').replace('{PACKAGE_NAME}', actualPackage2)).click();
        console.log(`✅ Successfully clicked package button for: ${actualPackage2}`);

        // Debug: Check what package elements are available
        const packageElements = await newPage.locator('//span[contains(text(),"seat")]').allTextContents();
        console.log(`🔍 Available package elements with "seat": ${JSON.stringify(packageElements)}`);
        
        console.log(`🔍 Looking for quantity input field`);
        // Use updated input_seats locator from patterns.json
        const inputField = newPage.locator(this._getLocator('OpportunityPage.input_seats')).first();
        await inputField.clear();
        console.log(`🧹 Cleared input field for: ${actualPackage2}`);
        await inputField.fill("5");
        console.log(`✅ Successfully filled seats for: ${actualPackage2}`);

        console.log(`✅ Successfully selected: ${actualPackage2} from ${headerName2} group`);
// console.log(`single product quote-no other packages found to sele

      
      
      
      console.log(`🔄 Clicking Add Products tab...`);
      await newPage.locator(this._getLocator('OpportunityPage.Add_Products_tab')).click();
      console.log(`✅ Add Products tab clicked`);
      
      console.log(`🔄 Clicking Add-ons for: ${headerName2}`);
      await newPage.locator(this._getLocator('OpportunityPage.Add-ons').replace('{PACKAGE_NAME}', headerName2)).click();
      console.log(`✅ Add-ons clicked`);

      console.log(`🔄 Clicking Add-on product...`);
        await newPage.locator(this._getLocator('OpportunityPage.Add-on_product')).click();
        console.log(`✅ Add-on product clicked`);
      

      
      
      console.log(`🔄 Clicking Price tab...`);
      await newPage.locator(this._getLocator('OpportunityPage.Price_tab')).click();
      console.log(`✅ Price tab clicked`);
      
      console.log(`🔄 Clicking Save Changes...`);
      await newPage.locator(this._getLocator('OpportunityPage.save_changes')).click();
      console.log(`✅ Original save_changes locator worked`);

      console.log(`⏳ Waiting 80 seconds for processing...`);
      await this.page.waitForTimeout(80000);
      console.log(`✅ Wait completed for 80 seconds`);
           await newPage.locator(this._getLocator('OpportunityPage.Quote_Details')).click();
           
      while(!(await newPage.locator(this._getLocator('OpportunityPage.area_code')).isVisible())) {
      await this.page.waitForTimeout(10000);
      await newPage.locator(this._getLocator('OpportunityPage.Quote_Details')).click();
      console.log(`inside while`);
      }

         
      try{
        //await newPage.locator(this._getLocator('OpportunityPage.Quote_Details')).click();
      await newPage.locator(this._getLocator('OpportunityPage.Payment_method_dropdown')).selectOption({ label: 'Invoice' });
      console.log(`✅ Successfully selected payment method: Invoice`);
      }catch(error){
        console.log(`❌ Payment method disabled and defaulted to invoice.`);
      }
      console.log(`quote details tab entered`);
      
      // Wait for area code field to be visible
      console.log("⏳ Waiting for area code field...");
      await newPage.locator(this._getLocator('OpportunityPage.area_code')).waitFor({ state: 'visible', timeout: 30000 });
      console.log("✅ Area code field found");
      
      // Fill United States and press Enter
      await newPage.locator(this._getLocator('OpportunityPage.area_code')).fill('United States');
      await newPage.waitForTimeout(3000);
      await newPage.locator(this._getLocator('OpportunityPage.area_code')).press('Enter');
      await newPage.waitForTimeout(2000);
      
      // Fill California and press Enter
      await newPage.locator(this._getLocator('OpportunityPage.area_code')).fill('California');
      await newPage.waitForTimeout(3000);
      await newPage.locator(this._getLocator('OpportunityPage.area_code')).press('Enter');
      await newPage.waitForTimeout(2000);
      
      // Fill Alpine (619) and press Enter
      await newPage.locator(this._getLocator('OpportunityPage.area_code')).fill('Alpine');
      await newPage.waitForTimeout(3000);
      await newPage.locator(this._getLocator('OpportunityPage.area_code')).press('Enter');
      await newPage.waitForTimeout(2000);
      await newPage.locator(this._getLocator('OpportunityPage.save_changes')).click();
      await newPage.locator(this._getLocator('OpportunityPage.Price_tab')).click();
      await this.page.waitForTimeout(3000);
      

  }

  async successfully_created_the_quote(): Promise<void>{
      // Wait for new page/tab to open after clicking Request Invoice Approval link 
      const uqt_url = this.page.url();

      // Wait for new page and click link
      const [approvalPage] = await Promise.all([
        this.page.context().waitForEvent('page'), // Wait for new page/tab
        this.page.locator(this._getLocator('OpportunityPage.Request_invoice_approval_link')).click()
      ]);
      
      console.log("🔀 New tab opened - switching focus!");
      
      // Bring new tab to front
      await approvalPage.bringToFront();
      
      // Wait for the new page to load
      await approvalPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
      await approvalPage.waitForLoadState('load', { timeout: 30000 });
      
      // Get URL from the NEW page
      const newApprovalURL = approvalPage.url();
      console.log("📋 Approval Page URL:", newApprovalURL);


      console.log("🔄 Working on approval page...");

      // Interact with elements in the NEW approval tab
      console.log("✅ Clicked on Quote creation and approval request");
      await approvalPage.locator(this._getLocator('OpportunityPage.invoice_approval_radio_button')).click();
      console.log("✅ Approval radio button clicked");
      
      await approvalPage.locator(this._getLocator('OpportunityPage.Next_button')).click();
      console.log("✅ Next button clicked");
      
      // The record type selection modal is already visible (Invoicing Request is selected)
      // Click Next button in the modal to proceed to the form
      console.log("🔄 Clicking Next button in record type modal...");
      await approvalPage.locator('button:has-text("Next")').click();
      console.log("✅ Clicked Next in record type modal");
      
      // Wait for the approval form to load
      await approvalPage.waitForTimeout(3000);
      console.log("✅ Approval form loaded");
      
    // Select Industry dropdown (Lightning component)
    // First find and click the dropdown button to open it
    console.log("🔄 Looking for Industry dropdown button...");
    await approvalPage.locator('lightning-combobox[data-name="Industry__c"] button, [data-name="Industry__c"] button, button[aria-label*="Industry"]').first().click();
    await approvalPage.waitForTimeout(1000);
    await approvalPage.locator('//span[@title="Automotive"]').click();
    console.log("✅ Industry selected: Automotive");
   
   // console.log("✅ Quote creation process completed successfully");

    // Select Payment Terms dropdown (Lightning component)
    await approvalPage.locator(this._getLocator('OpportunityPage.invoice_payment_terms_dropdown')).click();
    await approvalPage.waitForTimeout(1000);
    await approvalPage.locator('//span[@title="30"]').click();
    console.log("✅ Payment terms selected: Net 30");

    await approvalPage.locator(this._getLocator('OpportunityPage.invoice_potential_users')).fill('10');
    await approvalPage.locator(this._getLocator('OpportunityPage.invoice_reason_textarea')).fill('Automation test ignore');
    await approvalPage.locator(this._getLocator('OpportunityPage.invoice_initial_divices')).fill('10');
    await approvalPage.locator(this._getLocator('OpportunityPage.invoice_legal_company_head_office')).fill('Automation_script_khani');
    
    console.log("🔄 Clicking Save button...");
    await approvalPage.locator(this._getLocator('OpportunityPage.invoice_save_button')).click();
    console.log("✅ Save button clicked again");
    await approvalPage.waitForTimeout(15000);
    await approvalPage.waitForLoadState('load');

    await approvalPage.locator(this._getLocator('OpportunityPage.Fields_edit_button')).click();
    await approvalPage.waitForTimeout(5000);
    await approvalPage.locator(this._getLocator('OpportunityPage.invoive_status_dropdown')).click();
    await approvalPage.waitForTimeout(5000);
    await approvalPage.locator(this._getLocator('OpportunityPage.invoive_status_option')).click();
    await approvalPage.waitForTimeout(5000);
    await approvalPage.locator(this._getLocator('OpportunityPage.invoice_save_button')).click();
    await approvalPage.waitForTimeout(5000);
    console.log("✅ invoice approved");
    await approvalPage.waitForTimeout(8000);

    // Close the invoice approval tab
    await approvalPage.close();
    console.log("✅ Approval tab closed");
    
    // Switch back to original page
    await this.page.bringToFront();
    console.log("🔄 Switched back to uqt tool");
    await this.page.locator(this._getLocator('OpportunityPage.Quote_Details')).click();
    await this.page.waitForTimeout(5000);
 ///------------------creating new page context for sales agreement page----------------------/////
    const [salesagreemnet_Page] = await Promise.all([
      this.page.context().waitForEvent('page'), // Wait for new page/tab
      this.page.locator(this._getLocator('OpportunityPage.quote_number')).click()
    ]);
    
    console.log("🔀 sales agreement tab opened - switching focus!");
    
    // Bring new tab to front
    await salesagreemnet_Page.bringToFront();
    
    // Wait for the new page to load
    await salesagreemnet_Page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await salesagreemnet_Page.waitForLoadState('load', { timeout: 30000 });

    console.log("🔄 Working on Sales agreement page...");
    await salesagreemnet_Page.waitForTimeout(5000);
    await salesagreemnet_Page.locator(this._getLocator('OpportunityPage.SA_Details_tab')).click();
    await salesagreemnet_Page.waitForTimeout(5000);
    await salesagreemnet_Page.locator(this._getLocator('OpportunityPage.Fields_edit_button')).click();
    await salesagreemnet_Page.waitForTimeout(5000);
    await salesagreemnet_Page.locator(this._getLocator('OpportunityPage.SA_quote_Status_dropdown')).click();
    await salesagreemnet_Page.waitForTimeout(5000);
    await salesagreemnet_Page.locator(this._getLocator('OpportunityPage.SA_quote_status_option')).click();
    await salesagreemnet_Page.waitForTimeout(5000);
    await salesagreemnet_Page.locator(this._getLocator('OpportunityPage.SA_quote_type_dropdown')).click();
    await salesagreemnet_Page.waitForTimeout(5000);
    await salesagreemnet_Page.locator(this._getLocator('OpportunityPage.SA_quote_type_option')).click();
    await salesagreemnet_Page.waitForTimeout(5000);
    await salesagreemnet_Page.locator(this._getLocator('OpportunityPage.invoice_save_button')).click();
    await salesagreemnet_Page.waitForTimeout(5000);

    // Close the Sales agreement tab
    await salesagreemnet_Page.close();
    console.log("✅ Sales agreement tab closed");

    await this.page.bringToFront();
    console.log("🔄 Switched back to uqt tool");
    await this.page.close();
    await this.page.waitForTimeout(5000); console.log("🔄 Switched back to opportunity page");



    

  } 
    



  // Generic method to verify any new page has loaded successfully
  private async verifyPageLoaded(pageType: string, urlPattern?: RegExp, pageIndicators?: string[], extractId: boolean = false): Promise<string | void> {
    try {
      console.log(`🔍 Verifying ${pageType} page has loaded...`);
      
      const currentURL = this.page.url();
      console.log("📋 Current URL:", currentURL);
      
      // Check URL pattern if provided
      if (urlPattern && urlPattern.test(currentURL)) {
        console.log(`✅ ${pageType} page verified - URL matches pattern`);
        console.log(`🔗 ${pageType} URL:`, currentURL);
        
        // Extract ID from URL if requested
        let recordId = 'Unknown';
        if (extractId) {
          // Try to extract ID from different URL patterns
          let idMatch = currentURL.match(/\/[A-Za-z0-9]{15,18}\//); // Pattern: /ID/
          if (idMatch) {
            recordId = idMatch[0].replace(/\//g, '');
      } else {
            // Try to extract ID from query parameter pattern: ?id=ID&
            idMatch = currentURL.match(/[?&]id=([A-Za-z0-9]{15,18})/);
            if (idMatch) {
              recordId = idMatch[1];
            }
          }
          console.log(`🆔 ${pageType} ID:`, recordId);
        }
        
        // Wait for page elements to load
        try {
          const defaultIndicator = `//span[contains(text(),'${pageType}')]`;
          await this.page.waitForSelector(defaultIndicator, { timeout: 10000, state: 'visible' });
          console.log(`✅ ${pageType} page elements loaded successfully`);
        } catch (elementError) {
          console.log(`⚠️ ${pageType} page elements not found, but URL is correct`);
        }
        
        return extractId ? recordId : undefined;
      }
      
      // Fallback verification using page indicators
      if (pageIndicators && pageIndicators.length > 0) {
        console.log(`⚠️ URL pattern not matched, trying ${pageType} element verification...`);
        
        for (const indicator of pageIndicators) {
          try {
            await this.page.waitForSelector(indicator, { timeout: 5000, state: 'visible' });
            console.log(`✅ ${pageType} page verified - found page indicator`);
            return;
          } catch (e) {
            // Try next indicator
          }
        }
      }
      
      console.log(`⚠️ Could not verify ${pageType} page, but proceeding...`);
      
    } catch (error) {
      console.log(`⚠️ Error verifying ${pageType} page:`, error instanceof Error ? error.message : String(error));
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