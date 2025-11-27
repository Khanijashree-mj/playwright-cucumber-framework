import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { pageFixture } from "../fixtures/pageFixture";

/**
 * QuotePage - Handles quote creation and package selection
 */
export class QuotePage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    /**
     * Required by BasePage - Verify that the Quote page has loaded
     */
    async verifyPageIsLoaded(): Promise<void> {
        console.log('🔍 Verifying Quote page is loaded...');
        await this.page.waitForLoadState('domcontentloaded');
        console.log('✅ Quote page loaded');
    }

    /**
     * Select packages for the quote
     * @param packageName1 - First package name (e.g., "Professional Services - Professional Services")
     * @param packageName2 - Second package name (e.g., "Office-RingEX Premium")
     * @param packageName3 - Third package name (optional)
     * @param country - Country for area code selection
     */
    async selectPackage(packageName1: string, packageName2: string, packageName3: string, country: string): Promise<void> {
        // Sync this instance with pageFixture (updated by OpportunityPage)
        this.page = pageFixture.page;
        console.log("✅ QuotePage synced with current page context");
        
        // Use the current page (new page was already handled in create_new_quote)
        const newPage = this.page;
       
        // Split package names: If has '-' use part after '-', otherwise use full name
        const actualPackage1 = packageName1.includes('-') ? packageName1.split('-')[1].trim() : packageName1.trim();
        const actualPackage2 = packageName2.includes('-') ? packageName2.split('-')[1].trim() : packageName2.trim();
        const actualPackage3 = packageName3.includes('-') ? packageName3.split('-')[1].trim() : packageName3.trim();
        
        // Extract header names: If has '-' use part before '-', otherwise use full name  
        const headerName1 = packageName1.includes('-') ? packageName1.split('-')[0].trim() : packageName1.trim();
        const headerName2 = packageName2.includes('-') ? packageName2.split('-')[0].trim() : packageName2.trim();
        const headerName3 = packageName3.includes('-') ? packageName3.split('-')[0].trim() : packageName3.trim();
        
        console.log(`🔍 Packages to select: Package1="${headerName1}", Package2="${headerName2}", Package3="${headerName3}"`);
        
        // Always unselect the default Office package first (clean slate approach)
        console.log(`🔄 Unselecting default Office package to start fresh...`);
        await newPage.waitForTimeout(3000);
        try {
          await newPage.locator(this._getLocator('Quote_Page.Unselect_office_package_button')).click();
          console.log(`✅ Unselected default Office package`);
          await newPage.waitForTimeout(2000);
          
          // Close the Office package header to collapse it
          console.log(`🔄 Closing Office package header...`);
          await newPage.locator(this._getLocator('Quote_Page.Close_package_header_button')).click();
          console.log(`✅ Office package header closed`);
          await newPage.waitForTimeout(1000);
        } catch (error) {
          console.log(`⚠️  Could not find Office unselect button or close header button, continuing...`);
        }
        
        // Use switch-based helper method to select packages
        console.log(`\n🚀 Starting package selection with switch-based approach...\n`);
        await newPage.waitForTimeout(3000);
        
        // Handle Package 1 - 5 seats
        await this.handlePackageSelection(newPage, packageName1, headerName1, actualPackage1, 1, 5);
        
        // Handle Package 2 - 3 seats
        await this.handlePackageSelection(newPage, packageName2, headerName2, actualPackage2, 2, 3);
        
        // Handle Package 3 - 7 seats
        await this.handlePackageSelection(newPage, packageName3, headerName3, actualPackage3, 3, 7);
      
        console.log(`🔄 Clicking Add Products tab...`);
        await newPage.locator(this._getLocator('Quote_Page.UQT_tabs').replace('{tab_name}', 'Add Products')).click();
        console.log(`✅ Add Products tab clicked`);
        
        // Wait for page to fully load after clicking Add Products tab
        console.log(`⏳ Waiting for Add Products page to load...`);
        await newPage.waitForLoadState('domcontentloaded');
        await newPage.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => console.log("⚠️ Network not idle, continuing..."));
        await newPage.waitForTimeout(8000); // Increased wait for dynamic content to load
        
        try{
          console.log(`🔄 Clicking Add-ons for: ${headerName1}`);
          const addOnLocator = newPage.locator(this._getLocator('Quote_Page.Add-ons').replace('{PACKAGE_NAME}', headerName1));
          // Wait for Add-ons element to be visible before clicking
          await addOnLocator.waitFor({ state: 'visible', timeout: 20000 }); // Increased timeout
          await addOnLocator.click();
          console.log(`✅ Add-ons clicked`);

          console.log(`🔄 Clicking Add-on product...`);
          await newPage.locator(this._getLocator('Quote_Page.Add-on_product')).click();
          console.log(`✅ Add-on product clicked`);
          
          try{
            console.log(`🔄 Clicking Add-ons for: ${headerName2}`);
            const addOnLocator2 = newPage.locator(this._getLocator('Quote_Page.Add-ons').replace('{PACKAGE_NAME}', headerName2));
            await addOnLocator2.waitFor({ state: 'visible', timeout: 10000 });
            await addOnLocator2.click();
            console.log(`✅ Add-ons clicked`);
      
            console.log(`🔄 Clicking Add-on product...`);
              await newPage.locator(this._getLocator('Quote_Page.Add-on_product')).click();
              console.log(`✅ Add-on product clicked`);
          }catch(error){
            console.log(`🔄 Clicking Add-ons for: ${headerName3}`);
            const addOnLocator3 = newPage.locator(this._getLocator('Quote_Page.Add-ons').replace('{PACKAGE_NAME}', headerName3));
            await addOnLocator3.waitFor({ state: 'visible', timeout: 10000 });
            await addOnLocator3.click();
            console.log(`✅ Add-ons clicked`);
      
            console.log(`🔄 Clicking Add-on product...`);
            await newPage.locator(this._getLocator('Quote_Page.Add-on_product')).click();
            console.log(`✅ Add-on product clicked`);
          }
        }finally{
          console.log(`🔄 products added successfully`);
        }

        if(headerName1 === 'Engage Voice Standalone' || headerName2 === 'Engage Voice Standalone' || headerName3 === 'Engage Voice Standalone'){
          console.log(`🔄 select storage for Engage Voice Standalone package...`);
          await newPage.locator(this._getLocator('Quote_Page.Add-ons-search-field')).click(); // Explicit click to focus
          console.log(`✅ Clicked on input field`);
          await newPage.locator(this._getLocator('Quote_Page.Add-ons-search-field')).fill('Storage');
          console.log(`✅ Filled storage field`);
          await newPage.waitForTimeout(2000);
          await newPage.locator(this._getLocator('Quote_Page.Add-on_product')).click();
          console.log(`✅ storage product added`);
          await newPage.waitForTimeout(2000);
          await newPage.locator(this._getLocator('Quote_Page.Add-ons-search-field')).clear();
          await newPage.locator(this._getLocator('Quote_Page.Add-ons-search-field')).fill('Overage');
          console.log(`✅ Filled Overage field`);
          await newPage.waitForTimeout(2000);
          await newPage.locator(this._getLocator('Quote_Page.Add-on_product')).filter({ hasNot: newPage.locator('[disabled]') }).first().click();
          console.log(`✅ Overage product added`);
          await newPage.waitForTimeout(2000);
        }

        if(headerName1 === 'Professional Services' || headerName2 === 'Professional Services' || headerName3 === 'Professional Services'){
          console.log(`🔄 select products for Professional Services package...`);

          await newPage.waitForTimeout(2000);
          await newPage.locator(this._getLocator('Quote_Page.Proserv_add_products').replace('{PS_product}', 'RCCC')).click();
          await newPage.locator(this._getLocator('Quote_Page.Add-on_product')).click();
          console.log(`✅ RCCC product added`);

          await newPage.waitForTimeout(2000);
          await newPage.locator(this._getLocator('Quote_Page.Proserv_add_products').replace('{PS_product}', 'RCX')).click();
          await newPage.locator(this._getLocator('Quote_Page.Add-on_product')).click();
          console.log(`✅ RCX product added`);

          await newPage.waitForTimeout(2000);
          await newPage.locator(this._getLocator('Quote_Page.Proserv_add_products').replace('{PS_product}', 'REX')).click();
          await newPage.locator(this._getLocator('Quote_Page.Add-on_product')).click();
          console.log(`✅ REX product added`);

          console.log(`🔄 Clicking PS phases tab...`);
          await newPage.locator(this._getLocator('Quote_Page.UQT_tabs').replace('{tab_name}', 'PS Phases')).click();
          console.log(`✅ PS phases tab clicked`);

          for(let i = 0; i < 3; i++){
          // Get all "Add Phase" buttons and click the first one (there's only one at the top)
          await newPage.locator("//button[text()=' Add Phase ']").first().click();
          console.log(`✅ Add phase button clicked`);
          await newPage.waitForTimeout(1000);
          
          // Get all "Add Product" buttons and click the last one (newly added phase)
          await newPage.locator("//button[text()=' Add Product ']").last().click();
          console.log(`✅ Add product button clicked for phase ${i + 1}`);
          await newPage.waitForTimeout(1000);
          
          // Get all "Apply" buttons and click the last one (for the current phase)
          await newPage.locator("//button[text()='Apply']").last().click();
          console.log(`✅ Apply button clicked for phase ${i + 1}`);
          await newPage.waitForTimeout(2000);
        }
        } // Close Professional Services if block
        
        console.log(`🔄 Clicking Price tab...`);
        await newPage.locator(this._getLocator('Quote_Page.UQT_tabs').replace('{tab_name}', 'Price')).click();
        console.log(`✅ Price tab clicked`);
        
        // Wait for Price page to load completely
        console.log(`⏳ Waiting for Price page to load...`);
        await newPage.waitForLoadState('domcontentloaded');
        await newPage.waitForTimeout(5000); // Increased wait for calculations
        
        console.log(`🔄 Waiting for Save Changes button to become enabled...`);
        const saveChangesBtn = newPage.locator(this._getLocator('Quote_Page.save_changes'));
        await saveChangesBtn.waitFor({ state: 'visible', timeout: 10000 });
        
        // Wait for button to become enabled (not disabled)
        const xpathSelector = this._getLocator('Quote_Page.save_changes').replace('xpath=', '');
        await newPage.waitForFunction(
          (xpath) => {
            const btn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement;
            return btn && !btn.hasAttribute('disabled') && !btn.classList.contains('disabled');
          },
          xpathSelector,
          { timeout: 60000 }
        );
        console.log(`✅ Save Changes button is now enabled`);
        
        await saveChangesBtn.click();
        console.log(`✅ Save Changes clicked`);

        console.log(`⏳ Waiting for progress bar to complete...`);
        
        // Wait for progress bar to reach 100%
        let progress = 0;
        const startTime = Date.now();
        const maxWaitTime = 120000; // 2 minutes
        
        try {
          // Wait for progress bar to appear first
          await newPage.locator('.slds-progress-bar[role="progressbar"]').waitFor({ state: 'visible', timeout: 10000 });
          console.log(`📊 Progress bar detected, monitoring completion...`);
          
          // Poll the progress bar until it reaches 100%
          while (progress < 100 && (Date.now() - startTime < maxWaitTime)) {
            try {
              // Read from aria-valuenow attribute
              const progressBarElement = newPage.locator('.slds-progress-bar[role="progressbar"]');
              const progressValue = await progressBarElement.getAttribute('aria-valuenow');
              progress = parseInt(progressValue || '0');
              
              // Also read from progress text for verification
              const progressTextElement = newPage.locator('.progress-text span[aria-hidden="true"]');
              let progressText = '';
              try {
                progressText = await progressTextElement.textContent() || '';
              } catch (e) {
                progressText = 'Not visible';
              }
              
              // Log both values
              console.log(`📊 Progress Bar: ${progress}% | Text Display: ${progressText}`);
              
              if (progress >= 100) {
                console.log(`✅ Progress bar reached 100%!`);
                break;
              }
              
              // Wait 3 seconds before checking again
              await newPage.waitForTimeout(3000);
            } catch (err) {
              // Progress bar might have disappeared (completion)
              console.log(`⚠️ Progress bar disappeared - checking if completed...`);
              
              // Check if progress container is gone
              const containerExists = await newPage.locator('.progress-container').isVisible();
              if (!containerExists) {
                console.log(`✅ Progress container removed - process completed`);
                progress = 100;
                break;
              }
              
              // If container still exists but progress bar is gone, something is wrong

            }
          }
          
          
        } catch (e) {
          console.log(`⚠️ No progress bar found or already completed, continuing...`);
        }
        
        // === ONCE 100% COMPLETED, CLICK QUOTE DETAILS TAB ===
        console.log(`🎯 Progress complete, now clicking Quote Details tab...`);
        
        // Additional safety wait after completion
        //await newPage.waitForTimeout(3000);
        console.log(`✅ Post-processing wait completed`);
        
        // Click Quote Details tab after 100% completion
        await newPage.locator(this._getLocator('Quote_Page.UQT_tabs').replace('{tab_name}', 'Quote Details')).click({ force: true });
        console.log(`✅ Quote Details tab clicked successfully`);
        
        // Wait for Quote Details page to load completely
        console.log(`⏳ Waiting for Quote Details page to load...`);
        await newPage.waitForLoadState('domcontentloaded');
        await newPage.waitForTimeout(3000);
           
        try{
          //await newPage.locator(this._getLocator('Quote_Page.Quote_Details')).click();
        await newPage.locator(this._getLocator('Quote_Page.Payment_method_dropdown')).selectOption({ label: 'Invoice' });
        console.log(`✅ Successfully selected payment method: Invoice`);
        }catch(error){
          console.log(`❌ Payment method disabled and defaulted to invoice.`);
        }
        console.log(`quote details tab entered`);
        
        // Wait for area code field to be visible
        console.log("⏳ Waiting for area code field...");
        await newPage.locator(this._getLocator('Quote_Page.area_code')).waitFor({ state: 'visible', timeout: 30000 });
        console.log("✅ Area code field found");
        
        // Get address data for the country
        const addressData = this.testDataManager.getAddressData(country);
        console.log(`📍 Using area code data for ${country}:`, JSON.stringify(addressData, null, 2));

        try {
          // Fill Country and press Enter
          console.log(`🔍 Step 1: Filling country: ${addressData.Country}`);
          await newPage.locator(this._getLocator('Quote_Page.area_code')).fill(addressData.Country);
          await newPage.waitForTimeout(5000);
          await newPage.locator(this._getLocator('Quote_Page.area_code')).press('Enter');
          await newPage.waitForTimeout(2000);
          console.log(`✅ Country filled and submitted: ${addressData.Country}`);
          
          // Fill State/Area code state and press Enter
          console.log(`🔍 Step 2: Filling state/area: ${addressData.Area_code_state}`);
          await newPage.locator(this._getLocator('Quote_Page.area_code')).fill(addressData.Area_code_state);
          await newPage.waitForTimeout(5000);
          await newPage.locator(this._getLocator('Quote_Page.area_code')).press('Enter');
          await newPage.waitForTimeout(2000);
          console.log(`✅ State/Area filled and submitted: ${addressData.Area_code_state}`);
          
          // Fill Province/City area code and press Enter
          console.log(`🔍 Step 3: Filling province/city: ${addressData.Area_code_provience}`);
          await newPage.locator(this._getLocator('Quote_Page.area_code')).fill(addressData.Area_code_provience);
          await newPage.waitForTimeout(5000);
          await newPage.locator(this._getLocator('Quote_Page.area_code')).press('Enter');
          await newPage.waitForTimeout(3000);
          console.log(`✅ Province/City filled and submitted: ${addressData.Area_code_provience}`);
          
          // Verify Save Changes button is enabled
          const saveButton = newPage.locator(this._getLocator('Quote_Page.save_changes'));
          const isEnabled = await saveButton.isEnabled();
          console.log(`🔘 Save Changes button enabled: ${isEnabled}`);
          
          if (!isEnabled) {
            console.log(`⚠️ Save Changes button is still disabled! Taking screenshot...`);
            await newPage.screenshot({ path: 'save-button-disabled.png', fullPage: true });
          }
          
        } catch (error) {
          console.log(`❌ Error filling area code fields:`, error);
          await newPage.screenshot({ path: 'area-code-error.png', fullPage: true });
          throw error;
        }
        
        console.log(`🔄 Clicking Save Changes button...`);
        await newPage.locator(this._getLocator('Quote_Page.save_changes')).click();
        await this.page.waitForTimeout(2000);
        
        // Click Price tab to return to Price view
        console.log(`🔄 Clicking Price tab to finalize...`);
        await newPage.locator(this._getLocator('Quote_Page.UQT_tabs').replace('{tab_name}', 'Price')).click();
        
        

    }

    /**
     * Helper method to handle package selection based on package type using switch statement
     * @param page - The page object
     * @param fullPackageName - Full package name with header (e.g., "Office-RingEX Premium")
     * @param headerName - Package header/category (e.g., "Office", "Engage Digital Standalone", "Events")
     * @param actualPackage - Actual package name (e.g., "RingEX Premium", "concurrent seat based")
     * @param packageNumber - Package position (1, 2, or 3)
     * @param seats - Number of seats to fill
     */
    private async handlePackageSelection(
      page: any, 
      fullPackageName: string, 
      headerName: string, 
      actualPackage: string, 
      packageNumber: number, 
      seats: number
    ): Promise<void> {
      // Skip empty packages
      if (!fullPackageName || fullPackageName.trim() === '') {
        console.log(`⏭️  Skipping empty package${packageNumber}`);
        return;
      }

      console.log(`\n📦 Package ${packageNumber}: "${fullPackageName}"`);
      console.log(`   └─ Header: "${headerName}" | Actual: "${actualPackage}" | Seats: ${seats}`);
      
      await page.waitForTimeout(3000);

      // Switch statement to handle different package types
      switch(headerName) {
        case 'Office':
          console.log(`🏢 Handling Office package...`);
          // Select Office from dropdown (same as other packages now)
          await page.locator(this._getLocator('Quote_Page.Service_dropdown')).selectOption({ label: headerName });
          console.log(`✅ Selected header: ${headerName}`);
          
          // Click package button
          console.log(`🔍 Looking for Office package button: ${actualPackage}`);
          await page.locator(this._getLocator('Quote_Page.Package_select_button').replace('{PACKAGE_NAME}', actualPackage)).first().click();
          console.log(`✅ Successfully selected Office: ${actualPackage}`);
          // Note: No input filling for Office as per user's requirement
          break;

        case 'Engage Digital Standalone':
          console.log(`💬 Handling Engage Digital Standalone package...`);
          // Select from dropdown
          await page.locator(this._getLocator('Quote_Page.Service_dropdown')).selectOption({ label: headerName });
          console.log(`✅ Selected header: ${headerName}`);
          
          // Click package button
          console.log(`🔍 Looking for package button: ${actualPackage}`);
          await page.locator(this._getLocator('Quote_Page.Package_select_button').replace('{PACKAGE_NAME}', actualPackage)).click();
          console.log(`✅ Clicked package button`);
          
          // Fill input field
          console.log(`🔍 Looking for quantity input field within ${headerName} section`);
          const inputFieldED = page.locator(this._getLocator('Quote_Page.input_seats_by_group').replace('{GROUP_NAME}', headerName)).first();
          await inputFieldED.waitFor({ state: 'visible', timeout: 10000 });
          await inputFieldED.clear();
          await inputFieldED.fill(seats.toString());
          console.log(`✅ Filled ${seats} seats`);
          
          // Blur to trigger validation
          await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); });
          console.log(`🎯 Triggered validation (blur)`);
          break;

          case 'Engage Voice Standalone':
           console.log(`💬 Handling Engage Voice Standalone package...`);
          // Select from dropdown
          await page.locator(this._getLocator('Quote_Page.Service_dropdown')).selectOption({ label: headerName });
          console.log(`✅ Selected header: ${headerName}`);
          
          // Click package button
          console.log(`🔍 Looking for package button: ${actualPackage}`);
          await page.locator(this._getLocator('Quote_Page.Package_select_button').replace('{PACKAGE_NAME}', actualPackage)).click();
          console.log(`✅ Clicked package button`);
          
          // Fill input field
          console.log(`🔍 Looking for quantity input field within ${headerName} section`);
          const inputFieldEV = page.locator(this._getLocator('Quote_Page.input_seats_by_group').replace('{GROUP_NAME}', headerName)).first();
          await inputFieldEV.waitFor({ state: 'visible', timeout: 10000 });
          await inputFieldEV.clear();
          await inputFieldEV.fill(seats.toString());
          console.log(`✅ Filled ${seats} seats`);
          
          // Blur to trigger validation
          await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); });
          console.log(`🎯 Triggered validation (blur)`);
          break;

        case 'Events':
          console.log(`🎉 Handling Events package...`);
          // Select from dropdown
          await page.locator(this._getLocator('Quote_Page.Service_dropdown')).selectOption({ label: headerName });
          console.log(`✅ Selected header: ${headerName}`);
          
          // Click package button
          console.log(`🔍 Looking for package button: ${actualPackage}`);
          await page.locator(this._getLocator('Quote_Page.Package_select_button').replace('{PACKAGE_NAME}', actualPackage)).click();
          console.log(`✅ Clicked package button`);
          
          // Fill input field
          console.log(`🔍 Looking for quantity input field within ${headerName} section`);
          const inputFieldEvents = page.locator(this._getLocator('Quote_Page.input_seats_by_group').replace('{GROUP_NAME}', headerName)).first();
          await inputFieldEvents.waitFor({ state: 'visible', timeout: 10000 });
          await inputFieldEvents.clear();
          await inputFieldEvents.fill(seats.toString());
          console.log(`✅ Filled ${seats} seats`);
          
          // Blur to trigger validation
          await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); });
          console.log(`🎯 Triggered validation (blur)`);
          break;

        case 'RingCentral Contact Center':
          console.log(`📞 Handling RingCentral Contact Center package...`);
          // Select from dropdown
          await page.locator(this._getLocator('Quote_Page.Service_dropdown')).selectOption({ label: headerName });
          console.log(`✅ Selected header: ${headerName}`);
          
          // Click package button
          console.log(`🔍 Looking for package button: ${actualPackage}`);
          await page.locator(this._getLocator('Quote_Page.Package_select_button').replace('{PACKAGE_NAME}', actualPackage)).click();
          console.log(`✅ Clicked package button`);
          
          // Fill input field
          console.log(`🔍 Looking for quantity input field within ${headerName} section`);
          const inputFieldCC = page.locator(this._getLocator('Quote_Page.input_seats_by_group').replace('{GROUP_NAME}', headerName)).first();
          await inputFieldCC.waitFor({ state: 'visible', timeout: 10000 });
          await inputFieldCC.clear();
          await inputFieldCC.fill(seats.toString());
          console.log(`✅ Filled ${seats} seats`);
          
          // Blur to trigger validation
          await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); });
          console.log(`🎯 Triggered validation (blur)`);
          break;

        case 'Professional Services':
          console.log(`🛠️  Handling Professional Services package...`);
          // Select from dropdown
          await page.locator(this._getLocator('Quote_Page.Service_dropdown')).selectOption({ label: headerName });
          console.log(`✅ Selected header: ${headerName}`);
          
          // Click package button
          console.log(`🔍 Looking for package button: ${actualPackage}`);
          await page.locator(this._getLocator('Quote_Page.Package_select_button').replace('{PACKAGE_NAME}', actualPackage)).click();
          console.log(`✅ Clicked package button`);
          await page.locator(this._getLocator('Quote_Page.UC_check_box')).click();
          console.log(`✅ UC check box clicked`);
          await page.locator(this._getLocator('Quote_Page.CC_check_box')).click();
          console.log(`✅ CC check box clicked`);
          break;

        default:
          console.log(`❓ Unknown package type: "${headerName}" - attempting generic selection`);
          break;
      }
      
      console.log(`✅ Package ${packageNumber} selection completed\n`);
    }

    /**
     * Complete the quote creation process including invoice approval and sales agreement
     */
    async successfully_created_the_quote(): Promise<void>{
        // Sync this instance with pageFixture
        this.page = pageFixture.page;
        console.log("✅ successfully_created_the_quote synced with current page context");
        
        // Wait for new page/tab to open after clicking Request Invoice Approval link 
        const uqt_url = this.page.url();

        // Click approval link with IIFE for try-catch handling
        await (async () => {
          try {
            const pagesBefore = this.page.context().pages().length;
            console.log(`📊 Pages count before click: ${pagesBefore}`);
            
            await this.page.locator(this._getLocator('Quote_Page.Request_invoice_approval_link')).click();
            console.log(`✅ Request invoice approval link clicked`);
            await this.page.waitForTimeout(3000); // Wait for page to start opening
            
            const pagesAfter = this.page.context().pages().length;
            console.log(`📊 Pages count after click: ${pagesAfter}`);
          } catch (error) {
            console.log(`❌ Request invoice approval link not found, trying inside error notification...`);
            await this.page.locator(this._getLocator('Quote_Page.price_tab_Error_notification')).click();
            console.log(`✅ Error notification clicked`);
            await this.page.waitForTimeout(1000); // Wait after error notification click
            
            const pagesBefore = this.page.context().pages().length;
            console.log(`📊 Pages count before click (error path): ${pagesBefore}`);
            
            await this.page.locator(this._getLocator('Quote_Page.Request_invoice_approval_link')).click();
            console.log(`✅ Request invoice approval link clicked from error notification`);
            await this.page.waitForTimeout(5000); // Wait longer for page to fully open and register
            
            const pagesAfter = this.page.context().pages().length;
            console.log(`📊 Pages count after click (error path): ${pagesAfter}`);
          }
        })(); // IIFE - Immediately Invoked Function Expression
        
        // Get the newest page from context after IIFE completes
        const pages = this.page.context().pages();
        const approvalPage = pages[pages.length - 1]; // The last page is the newest
        console.log(`📋 Total pages in context: ${pages.length}`);
        console.log("🔀 New tab opened - switching focus!");
        

        // Bring new tab to front
        await approvalPage.bringToFront();
        
        // Wait for the new page to load
        await approvalPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
        await approvalPage.waitForLoadState('load', { timeout: 30000 });
        
        // Get URL from the NEW page
        const newApprovalURL = approvalPage.url();
        console.log("📋 Approval Page URL:", newApprovalURL);
        
        // CRITICAL: Update page context for this instance and pageFixture
        this.page = approvalPage;
        pageFixture.page = approvalPage;
        console.log("✅ Page context updated for approval page");


        console.log("🔄 Working on approval page...");

        // Interact with elements in the NEW approval tab
        console.log("✅ Clicked on Quote creation and approval request");
        await approvalPage.locator(this._getLocator('Invoice_Approval_Page.invoice_approval_radio_button')).click();
        console.log("✅ Approval radio button clicked");
        
        await approvalPage.locator(this._getLocator('Invoice_Approval_Page.Next_button')).click();
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
      await approvalPage.locator(this._getLocator('Invoice_Approval_Page.invoice_payment_terms_dropdown')).click();
      await approvalPage.waitForTimeout(1000);
      await approvalPage.locator('//span[@title="30"]').click();
      console.log("✅ Payment terms selected: Net 30");

      await approvalPage.locator(this._getLocator('Invoice_Approval_Page.invoice_potential_users')).fill('10');
      await approvalPage.locator(this._getLocator('Invoice_Approval_Page.invoice_reason_textarea')).fill('Automation test ignore');
      await approvalPage.locator(this._getLocator('Invoice_Approval_Page.invoice_initial_divices')).fill('10');
      await approvalPage.locator(this._getLocator('Invoice_Approval_Page.invoice_legal_company_head_office')).fill('Automation_script_khani');
      
      console.log("🔄 Clicking Save button...");
      await approvalPage.locator(this._getLocator('Invoice_Approval_Page.invoice_save_button')).click();
      console.log("✅ Save button clicked again");
      await approvalPage.waitForTimeout(15000);
      await approvalPage.waitForLoadState('load');

      await approvalPage.locator(this._getLocator('Invoice_Approval_Page.Fields_edit_button')).click();
      await approvalPage.waitForTimeout(1000);
      await approvalPage.locator(this._getLocator('Invoice_Approval_Page.invoive_status_dropdown')).click();
      await approvalPage.waitForTimeout(1000);
      await approvalPage.locator(this._getLocator('Invoice_Approval_Page.invoive_status_option')).click();
      await approvalPage.waitForTimeout(1000);
      await approvalPage.locator(this._getLocator('Invoice_Approval_Page.invoice_save_button')).click();
      await approvalPage.waitForTimeout(1000);
      console.log("✅ invoice approved");
      await approvalPage.waitForTimeout(8000);

      // Close the invoice approval tab (browser auto-focuses previous tab)
      await approvalPage.close();
      console.log("✅ Approval tab closed - browser auto-focused quote page");
      
      // Update page references to the quote page (now auto-focused after closing approval tab)
      const allPages = approvalPage.context().pages();
      const quotePageRef = allPages.find(p => p.url().includes('QuoteWizard'));
      if (quotePageRef) {
        this.page = quotePageRef;
        pageFixture.page = quotePageRef;
        console.log("✅ Updated page context to quote page");
      } else {
        throw new Error("❌ Could not find quote page after closing approval");
      }
      await this.page.locator(this._getLocator('Quote_Page.Quote_Details')).click();
      await this.page.waitForTimeout(5000);
   ///------------------creating new page context for sales agreement page----------------------/////
      const [salesagreemnet_Page] = await Promise.all([
        this.page.context().waitForEvent('page'), // Wait for new page/tab
        this.page.locator(this._getLocator('Quote_Page.quote_number')).click()
      ]);
      
      console.log("🔀 sales agreement tab opened - switching focus!");
      
      // Bring new tab to front
      await salesagreemnet_Page.bringToFront();
      
      // Wait for the new page to load
      await salesagreemnet_Page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      await salesagreemnet_Page.waitForLoadState('load', { timeout: 30000 });
      
      // CRITICAL: Update page context for this instance and pageFixture
      this.page = salesagreemnet_Page;
      pageFixture.page = salesagreemnet_Page;
      console.log("✅ Page context updated for sales agreement page");

      console.log("🔄 Working on Sales agreement page...");
      await salesagreemnet_Page.waitForTimeout(5000);
      await salesagreemnet_Page.locator(this._getLocator('Sales_Agreement_Page.SA_Details_tab')).click();
      await salesagreemnet_Page.waitForTimeout(1000);
      await salesagreemnet_Page.locator(this._getLocator('Invoice_Approval_Page.Fields_edit_button')).click();
      await salesagreemnet_Page.waitForTimeout(1000);
      await salesagreemnet_Page.locator(this._getLocator('Sales_Agreement_Page.SA_quote_Status_dropdown')).click();
      await salesagreemnet_Page.waitForTimeout(1000);
      await salesagreemnet_Page.locator(this._getLocator('Sales_Agreement_Page.SA_quote_status_option')).click();
      await salesagreemnet_Page.waitForTimeout(1000);
      await salesagreemnet_Page.locator(this._getLocator('Sales_Agreement_Page.SA_quote_type_dropdown')).click();
      await salesagreemnet_Page.waitForTimeout(1000);
      await salesagreemnet_Page.locator(this._getLocator('Sales_Agreement_Page.SA_quote_type_option')).click();
      await salesagreemnet_Page.waitForTimeout(1000);

           // SALES AGREEMENT PAGE verify start and end date present
      const SA_StartDate = await salesagreemnet_Page.locator(this._getLocator('Sales_Agreement_Page.SA_start_date')).inputValue().catch(() => '');
      if (!SA_StartDate) {
        await salesagreemnet_Page.locator(this._getLocator('Sales_Agreement_Page.SA_start_date')).fill('11/27/2025');
        console.log("✅ SA Start Date added");
      } else {
        console.log(`✅ SA Start Date exists: ${SA_StartDate}`);
      }

      const SA_EndDate = await salesagreemnet_Page.locator(this._getLocator('Sales_Agreement_Page.SA_end_date')).inputValue().catch(() => '');
      if (!SA_EndDate) {
        await salesagreemnet_Page.locator(this._getLocator('Sales_Agreement_Page.SA_end_date')).fill('12/27/2025');
        console.log("✅ SA End Date added");
      } else {
        console.log(`✅ SA End Date exists: ${SA_EndDate}`);
      }
      await salesagreemnet_Page.locator(this._getLocator('Invoice_Approval_Page.invoice_save_button')).click();
      await salesagreemnet_Page.waitForTimeout(5000);

      // Close the Sales agreement tab (browser auto-focuses previous tab)
      await salesagreemnet_Page.close();
      console.log("✅ Sales agreement tab closed - browser auto-focused quote page");
      
      // Update page references to the quote page (now auto-focused after closing SA tab)
      const remainingPages = salesagreemnet_Page.context().pages();
      const finalQuotePage = remainingPages.find(p => p.url().includes('QuoteWizard'));
      if (finalQuotePage) {
        this.page = finalQuotePage;
        pageFixture.page = finalQuotePage;
        console.log("✅ Updated page context to quote page");
      } else {
        throw new Error("❌ Could not find quote page after closing sales agreement");
      }
      
      await this.page.waitForTimeout(3000);
      console.log("✅ Quote creation workflow completed successfully!");



      

    } 
}

