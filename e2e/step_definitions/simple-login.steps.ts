import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { pageFixture } from "../fixtures/pageFixture";
import { LoginPage } from "../pages/LoginPage";

setDefaultTimeout(60000);

// Create login page instance - will be initialized per scenario
let loginPage: LoginPage;

// =============================================================================
// SIMPLE STEP DEFINITIONS - Just delegate to LoginPage
// =============================================================================

// =============================================================================
// NAVIGATION STEPS
// =============================================================================

Given("I am on the login page", async () => {
  loginPage = new LoginPage(pageFixture.page);
  await loginPage.navigateToLoginPage();
  //await loginPage.verifyLoginPageLoaded();
});

Given("I navigate to the login page", async () => {
  loginPage = new LoginPage(pageFixture.page);
  await loginPage.navigateToLoginPage();
});

// =============================================================================
// LOGIN STEPS
// =============================================================================

When("I login with username {string} and password {string}", async (username: string, password: string) => {
  await loginPage.performLogin(username, password);
});



When("I login using patterns with username {string} and password {string}", async (username: string, password: string) => {
  await loginPage.performLoginWithPatterns(username, password);
});

When("I login using keyboard with username {string} and password {string}", async (username: string, password: string) => {
  await loginPage.performKeyboardLogin(username, password);
});

When("I login with data:", async (dataTable: any) => {
  const loginData = dataTable.hashes()[0];
  await loginPage.performDataDrivenLogin(loginData);
});

// =============================================================================
// VERIFICATION STEPS
// =============================================================================

Then("I should see login success", async () => {
  await loginPage.verifyLoginSuccess();
});

Then("I should see login error {string}", async (errorType: string) => {
  await loginPage.verifyLoginError(errorType);
});

Then("the login form should be empty", async () => {
  await loginPage.verifyLoginFormEmpty();
});

Then("I verify login page is loaded", async () => {
  await loginPage.verifyLoginPageLoaded();
});

// =============================================================================
// ACTION STEPS
// =============================================================================

When("I clear the login form", async () => {
  await loginPage.clearLoginForm();
});

When("I logout", async () => {
  await loginPage.performLogout();
});

When("I take login screenshot {string}", async (filename: string) => {
  await loginPage.takeLoginPageScreenshot(filename);
});

// =============================================================================
// VALIDATION STEPS
// =============================================================================

Then("I validate login form accessibility", async () => {
  await loginPage.validateLoginFormAccessibility();
});

// =============================================================================
// WORKFLOW STEPS
// =============================================================================

When("I execute complete login workflow with username {string} and password {string}", async (username: string, password: string) => {
  loginPage = new LoginPage(pageFixture.page);
  await loginPage.executeCompleteLoginWorkflow(username, password, true);
});

When("I execute failed login workflow with username {string} and password {string}", async (username: string, password: string) => {
  loginPage = new LoginPage(pageFixture.page);
  await loginPage.executeCompleteLoginWorkflow(username, password, false);
});

When("I execute multiple login tests:", async (dataTable: any) => {
  const testCases = dataTable.hashes().map((row: any) => ({
    username: row.username,
    password: row.password,
    shouldSucceed: row.shouldSucceed === 'true',
    description: row.description
  }));
  
  loginPage = new LoginPage(pageFixture.page);
  await loginPage.executeMultipleLoginTests(testCases);
});

// =============================================================================
// DEBUG STEPS
// =============================================================================

When("I debug current page state", async () => {
  await loginPage.debugCurrentState();
});

// =============================================================================
// COMBINED STEPS (Multiple actions in one step)
// =============================================================================

When("I perform complete login as {string} with password {string}", async (username: string, password: string) => {
  // This step combines navigation + login + verification
  loginPage = new LoginPage(pageFixture.page);
  await loginPage.navigateToLoginPage();
  await loginPage.verifyLoginPageLoaded();
  await loginPage.performLogin(username, password);
  await loginPage.verifyLoginSuccess();
});

When("I attempt invalid login as {string} with password {string}", async (username: string, password: string) => {
  // This step combines navigation + login + error verification
  loginPage = new LoginPage(pageFixture.page);
  await loginPage.navigateToLoginPage();
  await loginPage.verifyLoginPageLoaded();
  await loginPage.performLogin(username, password);
  await loginPage.verifyLoginError('invalid-credentials');
});
