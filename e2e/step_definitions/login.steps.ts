import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { pageFixture } from "../fixtures/pageFixture";

setDefaultTimeout(60000); // 60 seconds

Given("the user is on the login page", async () => {
  await pageFixture.page.goto(
    "https://practicetestautomation.com/practice-test-login",
  );
  const loginPageTitle = await pageFixture.page.title();
  expect(loginPageTitle).toContain("Test Login");
});

When("the user enters the username {string}", async (username: string) => {
  const usernameInput = pageFixture.page.getByLabel("Username");
  await usernameInput.fill(username);
});

When("the user enters the password {string}", async (password: string) => {
  const passwordInput = pageFixture.page.getByLabel("Password");
  await passwordInput.fill(password);
});

When("the user clicks on the login button", async () => {
  const loginButton = pageFixture.page.getByRole("button", { name: "Submit" });

  await loginButton.click();
});

Then("the user should see a success message", async () => {
  const successMessage = await pageFixture.page
    .getByRole("heading", { name: "Logged In Successfully" })
    .isVisible();

  expect(successMessage).toBe(true);
});

Then("the login attempt should fail", async () => {
  const errorMessageLocator = pageFixture.page.locator("#error");
  const errorMessageVisible = await errorMessageLocator.isVisible();
  expect(errorMessageVisible).toBe(true);
});

Then("the user should see a username required error", async () => {
  const errorMessageLocator = pageFixture.page.locator("#error");
  const errorMessageVisible = await errorMessageLocator.isVisible();
  expect(errorMessageVisible).toBe(true);
});

Then("the user should see a password required error", async () => {
  const errorMessageLocator = pageFixture.page.locator("#error");
  const errorMessageVisible = await errorMessageLocator.isVisible();
  expect(errorMessageVisible).toBe(true);
});

Then("the user should see a username and password required error", async () => {
  const errorMessageLocator = pageFixture.page.locator("#error");
  const errorMessageVisible = await errorMessageLocator.isVisible();
  expect(errorMessageVisible).toBe(true);
});
