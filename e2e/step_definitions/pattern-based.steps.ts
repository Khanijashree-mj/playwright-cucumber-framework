import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { pageFixture } from "../fixtures/pageFixture";
import { PatternBasedLoginPage } from "../pages/PatternBasedLoginPage";

setDefaultTimeout(60000); // 60 seconds

let patternBasedLoginPage: PatternBasedLoginPage;

// =============================================================================
// INITIALIZATION HOOKS
// =============================================================================

Given("I initialize the pattern-based page", async () => {
  patternBasedLoginPage = new PatternBasedLoginPage(pageFixture.page);
  console.log('✅ Pattern-based login page initialized');
});

// =============================================================================
// NAVIGATION STEPS
// =============================================================================

Given("I am on the login page using patterns", async () => {
  if (!patternBasedLoginPage) {
    patternBasedLoginPage = new PatternBasedLoginPage(pageFixture.page);
  }
  
  await patternBasedLoginPage.navigateToLoginPage();
  await patternBasedLoginPage.verifyPageIsLoaded();
  console.log('✅ Navigated to login page using pattern-based approach');
});

// =============================================================================
// TEMPLATE-BASED STEPS (PRIMARY APPROACH)
// =============================================================================

When("I enter username {string} using template", async (username: string) => {
  await patternBasedLoginPage.enterUsername(username);
});

When("I enter password {string} using template", async (password: string) => {
  await patternBasedLoginPage.enterPassword(password);
});

When("I click the login button using template", async () => {
  await patternBasedLoginPage.clickLoginButton();
});

// =============================================================================
// PATTERN-BASED STEPS (DYNAMIC APPROACH)
// =============================================================================

When("I fill the {string} field with {string} using pattern", async (fieldName: string, value: string) => {
  await patternBasedLoginPage.enterFormField(fieldName, value, 'name');
});

When("I fill the field with id {string} with {string} using pattern", async (fieldId: string, value: string) => {
  await patternBasedLoginPage.enterFormField(fieldId, value, 'id');
});

When("I fill the field with placeholder {string} with {string} using pattern", async (placeholder: string, value: string) => {
  await patternBasedLoginPage.enterFormField(placeholder, value, 'placeholder');
});

When("I click the button with text {string} using pattern", async (buttonText: string) => {
  await patternBasedLoginPage.clickButtonByText(buttonText);
});

When("I click the link with text {string} using pattern", async (linkText: string) => {
  await patternBasedLoginPage.clickLinkByText(linkText);
});

// =============================================================================
// DATA-DRIVEN STEPS
// =============================================================================

When("I fill multiple form fields using patterns:", async (dataTable: any) => {
  const fieldData = dataTable.hashes().map((row: any) => ({
    name: row.field,
    value: row.value,
    type: row.type || 'name'
  }));
  
  await patternBasedLoginPage.fillFormFields(fieldData);
});

When("I perform data-driven login with username {string} and password {string}", async (username: string, password: string) => {
  await patternBasedLoginPage.performDataDrivenLogin({ username, password });
});

// =============================================================================
// VERIFICATION STEPS
// =============================================================================

Then("I should see the success message using patterns", async () => {
  await patternBasedLoginPage.verifySuccessfulLogin();
});

Then("I should see the error message using patterns", async () => {
  await patternBasedLoginPage.verifyLoginFailed();
});

Then("I should see username required error using patterns", async () => {
  await patternBasedLoginPage.verifyUsernameRequiredError();
});

Then("I should see password required error using patterns", async () => {
  await patternBasedLoginPage.verifyPasswordRequiredError();
});

Then("I should see both fields required error using patterns", async () => {
  await patternBasedLoginPage.verifyBothFieldsRequiredError();
});

// =============================================================================
// UTILITY AND DEBUG STEPS
// =============================================================================

Then("I validate the pattern repository", async () => {
  const validation = patternBasedLoginPage.validateRepository();
  
  if (!validation.isValid) {
    console.error('❌ Repository validation failed:');
    console.error('Missing patterns:', validation.missingPatterns);
    console.error('Errors:', validation.errors);
    console.error('Warnings:', validation.warnings);
    throw new Error(`Repository validation failed: ${validation.errors.join(', ')}`);
  }
  
  console.log('✅ Repository validation successful');
});

Then("I log pattern repository statistics", async () => {
  const stats = patternBasedLoginPage.getRepositoryStats();
  console.log('📊 Pattern Repository Statistics:');
  console.log(`Version: ${stats.metadata.version}`);
  console.log(`Total Patterns: ${stats.metadata.totalPatterns}`);
  console.log(`Categories: ${stats.metadata.categories.join(', ')}`);
  console.log('Pattern Counts by Category:', stats.patternCounts);
  console.log('Template Counts by Category:', stats.templateCounts);
  console.log('Cache Statistics:', stats.cacheStats);
});

Then("I search for patterns containing {string}", async (searchText: string) => {
  const results = patternBasedLoginPage.searchPatterns(searchText);
  
  console.log(`🔍 Found ${results.length} patterns containing '${searchText}':`);
  results.forEach((result, index) => {
    console.log(`${index + 1}. Path: ${result.path}`);
    console.log(`   Pattern: ${result.pattern}`);
    console.log(`   Category: ${result.category}`);
  });
});

Then("I clear the pattern cache", async () => {
  patternBasedLoginPage.clearPatternCache();
});

Then("I log cache statistics", async () => {
  patternBasedLoginPage.logCacheStats();
});

// =============================================================================
// ADVANCED SCENARIO STEPS
// =============================================================================

When("I perform complete login with fallbacks using username {string} and password {string}", async (username: string, password: string) => {
  await patternBasedLoginPage.performCompleteLoginWithFallbacks(username, password);
});

// =============================================================================
// COMPLEX PATTERN STEPS
// =============================================================================

When("I verify element exists using complex pattern {string} with parameters:", async (patternPath: string, dataTable: any) => {
  const parameters: Record<string, string> = {};
  
  dataTable.hashes().forEach((row: any) => {
    parameters[row.parameter] = row.value;
  });
  
  const elementChecks = [{ pattern: patternPath, params: parameters }];
  await patternBasedLoginPage.verifyElementsExist(elementChecks);
});

// =============================================================================
// DEMONSTRATION STEPS
// =============================================================================

Given("I demonstrate pattern-based approach capabilities", async () => {
  console.log('🚀 Demonstrating Pattern-Based Object Repository capabilities...');
  
  // Initialize if not already done
  if (!patternBasedLoginPage) {
    patternBasedLoginPage = new PatternBasedLoginPage(pageFixture.page);
  }
  
  // Show repository stats
  const stats = patternBasedLoginPage.getRepositoryStats();
  console.log(`📊 Repository loaded with ${stats.metadata.totalPatterns} patterns`);
  
  // Validate repository
  const validation = patternBasedLoginPage.validateRepository();
  console.log(`✅ Repository validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
  
  // Show available pattern categories
  console.log(`📂 Available categories: ${stats.metadata.categories.join(', ')}`);
  
  // Search for common patterns
  const buttonPatterns = patternBasedLoginPage.searchPatterns('button');
  console.log(`🔍 Found ${buttonPatterns.length} button-related patterns`);
  
  const inputPatterns = patternBasedLoginPage.searchPatterns('input');
  console.log(`🔍 Found ${inputPatterns.length} input-related patterns`);
  
  console.log('✅ Pattern-based approach demonstration completed');
});
