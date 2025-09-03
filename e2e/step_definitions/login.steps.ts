import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { pageFixture } from "../fixtures/pageFixture";

setDefaultTimeout(60000); // 60 seconds

// Background step
Given("the user is on the login page", async () => {
  const loginPage = pageFixture.pageManager.getLoginPage();
  await loginPage.navigateToLoginPage();
  await loginPage.verifyLoginPageIsLoaded();
});

// When steps (Actions)
When("the user enters the username {string}", async (username: string) => {
  const loginPage = pageFixture.pageManager.getLoginPage();
  await loginPage.enterUsername(username);
});

When("the user enters the password {string}", async (password: string) => {
  const loginPage = pageFixture.pageManager.getLoginPage();
  await loginPage.enterPassword(password);
});

When("the user clicks on the login button", async () => {
  const loginPage = pageFixture.pageManager.getLoginPage();
  await loginPage.clickLoginButton();
});

// Then steps (Assertions)
Then("the user should see a success message", async () => {
  const loginPage = pageFixture.pageManager.getLoginPage();
  await loginPage.verifySuccessfulLogin();
});

Then("the login attempt should fail", async () => {
  const loginPage = pageFixture.pageManager.getLoginPage();
  await loginPage.verifyLoginFailed();
});

Then("the user should see a username required error", async () => {
  const loginPage = pageFixture.pageManager.getLoginPage();
  await loginPage.verifyUsernameRequiredError();
});

Then("the user should see a password required error", async () => {
  const loginPage = pageFixture.pageManager.getLoginPage();
  await loginPage.verifyPasswordRequiredError();
});

Then("the user should see a username and password required error", async () => {
  const loginPage = pageFixture.pageManager.getLoginPage();
  await loginPage.verifyBothFieldsRequiredError();
});
