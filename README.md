# Testing Strategy: Playwright + Cucumber

## What is End-to-End Testing?

End-to-End (E2E) testing is a testing methodology used to validate the functionality and performance of an application by testing it from start to finish, as a user would. This type of testing ensures that the entire application flow works as expected, including interactions between different components and systems. E2E tests simulate real user scenarios and verify that the system behaves correctly under those conditions.

### Why is End-to-End Testing Needed?

1. **Comprehensive Coverage:**

   - E2E testing covers the entire application stack, including frontend and backend components. This ensures that all parts of the application work together as expected.

2. **User Experience Validation:**

   - By simulating real user interactions, E2E tests validate the user experience and ensure that the application functions correctly from the user's perspective.

3. **Early Bug Detection:**

   - E2E tests help identify issues that may not be caught by unit or integration tests, particularly those involving multiple components or systems.

4. **Confidence in Deployments:**
   - Running E2E tests as part of the deployment pipeline provides confidence that the application will work as intended in production.

## What is Playwright?

Playwright is a modern end-to-end testing framework developed by Microsoft for web applications. It supports testing across multiple browsers, including Chromium, Firefox, and WebKit. Playwright offers a comprehensive and powerful API, enabling fine-grained control over browser interactions, automated testing of modern web applications, and handling complex user scenarios.

### Key Features of Playwright

- **Cross-Browser Testing:**
  - Supports Chromium, Firefox, and WebKit, ensuring compatibility across all major browsers.
- **Parallel Execution:**
  - Supports running tests in parallel, significantly speeding up test execution.
- **Automatic Waiting:**
  - Automatically waits for elements to be ready before performing actions, reducing the need for explicit waits.
- **Rich API:**
  - Provides a rich set of features and utilities tailored specifically for end-to-end testing.

## What is Cucumber?

Cucumber is a testing tool that supports Behavior-Driven Development (BDD). It allows tests to be written in a natural language style using Gherkin syntax, which is easy for non-developers, such as product owners or business analysts, to understand and contribute to. Cucumber facilitates improved communication between technical and non-technical team members and ensures that tests align closely with business requirements.

### Key Features of Cucumber

- **Behavior-Driven Development:**
  - Enables writing tests in Gherkin syntax, a natural language format that describes the behavior of the application.
- **Improved Communication:**
  - Bridges the gap between technical and non-technical team members, enhancing collaboration and understanding.
- **Reusable Steps:**
  - Allows for defining reusable steps, reducing redundancy and improving test suite maintainability.
- **Readable Documentation:**
  - Tests written in Gherkin also serve as documentation, making it easier to understand the application's expected behavior.

## What is Behavior-Driven Development (BDD)?

Behavior-Driven Development (BDD) is an agile software development methodology that encourages collaboration among developers, testers, and business stakeholders in a software project. BDD aims to improve communication and shared understanding of the software requirements by using examples to illustrate how the application should behave.

### Key Principles of BDD

1. **Collaboration:**

   - BDD involves all stakeholders, including developers, testers, and business analysts, in the development process to ensure that everyone has a shared understanding of the requirements and expected behavior of the application.

2. **Examples as Requirements:**

   - BDD uses concrete examples written in a natural language format to describe the behavior of the application. These examples are used as requirements and are implemented as automated tests.

3. **Focus on Behavior:**

   - BDD shifts the focus from testing the implementation details to testing the behavior of the application from the user's perspective. This ensures that the software meets the actual needs of the users.

4. **Executable Specifications:**
   - The examples used in BDD are written in a format that can be executed as tests. This ensures that the requirements are always up-to-date and that the application behaves as expected.

### Benefits of BDD

1. **Improved Communication:**

   - By using a common language to describe the behavior of the application, BDD improves communication between technical and non-technical team members, ensuring that everyone has a clear understanding of the requirements.

2. **Shared Understanding:**

   - BDD helps create a shared understanding of the requirements and expected behavior of the application among all stakeholders, reducing the risk of misunderstandings and ensuring that the software meets the actual needs of the users.

3. **Better Test Coverage:**

   - BDD encourages the creation of detailed and comprehensive examples that cover different scenarios and edge cases, leading to better test coverage and more reliable software.

4. **Living Documentation:**
   - The examples used in BDD are written in a natural language format and serve as living documentation that evolves with the application, making it easier to understand the application's behavior and requirements over time.

### Example of BDD in Gherkin Syntax

Here's an example of a BDD scenario written in Gherkin syntax for a user login feature:

```gherkin
Feature: User Authentication

  Background:
    Given the user is on the login page

  Scenario: Successful login with valid credentials
    When the user enters the username "student"
    And the user enters the password "Password123"
    And the user clicks on the login button
    Then the user should see a success message

  Scenario: Unsuccessful login with missing username
    When the user enters the username ""
    And the user enters the password "Test@123"
    And the user clicks on the login button
    Then the login attempt should fail
    And the user should see a username required error

  Scenario: Unsuccessful login with missing password
    When the user enters the username "student"
    And the user enters the password ""
    And the user clicks on the login button
    Then the login attempt should fail
    And the user should see a password required error

  Scenario: Unsuccessful login with missing username and password
    When the user enters the username ""
    And the user enters the password ""
    And the user clicks on the login button
    Then the login attempt should fail
    And the user should see a username and password required error
```

## Why Playwright + Cucumber?

### Benefits of Playwright

1. **Modern Web Testing Tool:**

   - Playwright is a modern end-to-end testing framework for web applications. It supports multiple browsers (Chromium, Firefox, and WebKit) and is maintained by Microsoft.

2. **Rich API:**

   - Playwright offers a comprehensive and powerful API, allowing for fine-grained control over browser interactions, automated testing of modern web applications, and handling complex user scenarios.

3. **Parallel Execution:**

   - Playwright supports parallel test execution, which significantly speeds up test runs by utilizing multiple browser instances.

4. **Automatic Waiting:**
   - Playwright automatically waits for elements to be ready before performing actions, reducing the need for explicit waits and making tests more reliable.

### Benefits of Cucumber

1. **Behavior-Driven Development (BDD):**

   - Cucumber facilitates BDD, allowing tests to be written in a natural language style (Gherkin syntax). This makes it easier for non-developers, such as product owners or business analysts, to understand and contribute to the test cases.

2. **Improved Communication:**

   - The Gherkin syntax improves communication between technical and non-technical team members, ensuring that everyone has a clear understanding of the requirements and how they are being tested.

3. **Reusable Steps:**

   - Cucumber allows for the definition of reusable steps, which can reduce redundancy and make the test suite more maintainable.

4. **Readable Documentation:**
   - Tests written in Gherkin also serve as documentation, making it easier to understand the application's expected behavior at a glance.

### Why Not Cypress?

1. **Limited Browser Support:**

   - Cypress primarily supports Chromium-based browsers. While it has experimental support for Firefox, it does not support WebKit, which can be a limitation for testing across all major browsers.

2. **Performance:**

   - While Cypress is fast, Playwright’s parallel test execution can lead to even faster test runs, especially for larger test suites.

3. **Integration Complexity:**
   - Integrating Cypress with Cucumber is possible but can be more complex compared to Playwright, which provides a more seamless integration.

### Why Not Playwright Alone?

1. **Stakeholder Collaboration:**

   - Cucumber’s natural language approach is beneficial for projects where non-technical stakeholders are involved in writing or reviewing test cases. This collaboration is less effective with Playwright’s native test runner.

2. **Readable Test Cases:**

   - Writing test cases in Gherkin syntax provides clear and readable documentation of test scenarios, which is not as easily achieved with Playwright’s built-in test runner.

3. **Behavior-Driven Development:**
   - For teams practicing BDD, Cucumber’s approach to defining tests in natural language is more aligned with their workflow compared to using Playwright’s native test runner.

## Code Structure

### Folder Structure

The folder structure for the Playwright + Cucumber setup is organized as follows:

```
├── e2e
│   ├── helper
│   │   ├── report
│   │   │   ├── init.ts
│   │   │   └── report.ts
│   ├── fixtures
│   │   └── pageFixture.ts
│   └── step-definitions
│       └── steps

.ts
├── test-results
│   ├── screenshots
│   ├── trace
│   └── videos
├── cucumber.json
├── hooks.ts
└── package.json
```

### `pageFixture.ts`

The `pageFixture.ts` file manages the `Page` object from Playwright:

```typescript
import { Page } from "@playwright/test";

export const pageFixture = {
  page: undefined as unknown as Page,
};
```

### `hooks.ts`

The `hooks.ts` file contains setup and teardown logic for Playwright and Cucumber:

```typescript
import {
  After,
  AfterAll,
  AfterStep,
  Before,
  BeforeAll,
  Status,
} from "@cucumber/cucumber";
import { pageFixture } from "../fixtures/pageFixture";
import { Browser, BrowserContext, Page, chromium } from "@playwright/test";
const fs = require("fs-extra");

let browser: Browser;
let page: Page;
let context: BrowserContext;

BeforeAll(async function () {
  browser = await chromium.launch({ headless: false, slowMo: 50 });
  console.log(browser.version);
});

Before(async function ({ pickle }) {
  const scenarioName = pickle.name + pickle.id;

  context = await browser.newContext({
    ignoreHTTPSErrors: true,
    recordVideo: {
      dir: "test-results/videos",
    },
  });
  await context.tracing.start({
    name: scenarioName,
    title: pickle.name,
    sources: true,
    screenshots: true,
    snapshots: true,
  });
  page = await context.newPage();
  pageFixture.page = page;
});

AfterStep(async function ({ pickle }) {
  const img = await pageFixture.page.screenshot({
    path: `./test-results/screenshot/${pickle.name}.png`,
    type: "png",
  });
  await this.attach(img, "image/png");
});

After(async function ({ pickle, result }) {
  let videoPath: string = "";
  let img: Buffer | undefined;
  const path = `./test-results/trace/${pickle.id}.zip`;

  if (result?.status === Status.PASSED) {
    img = await pageFixture.page.screenshot({
      path: `./test-results/screenshot/${pickle.name}.png`,
      type: "png",
    });

    videoPath = (await pageFixture.page.video()?.path()) ?? "";
  }

  await context.tracing.stop({ path });
  await pageFixture.page.close();
  await context.close();

  if (result?.status === Status.PASSED) {
    if (img) {
      await this.attach(img, "image/png");
    }

    if (videoPath) {
      try {
        const videoBuffer = fs.readFileSync(videoPath);
        await this.attach(videoBuffer, "video/webm");
      } catch (error) {
        console.error("Failed to read video file:", error);
      }
    }

    const traceFileLink = `<a href="https://trace.playwright.dev/">Open ${path}</a>`;
    await this.attach(`Trace file: ${traceFileLink}`, "text/html");
    await pageFixture.page.close();
    await context.close();
  }
});

AfterAll(async function () {
  browser.close();
});
```

## Screenshots and Videos

### Screenshots

- **Purpose:** Screenshots are taken at each step of the scenario to capture the state of the application during testing.
- **Location:** Screenshots are saved in the `test-results/screenshots` directory.
- **Example:**

  ![Successful login screenshot](./test-results/screenshots/Successful_login_with_valid_credentials.png)

### Videos

- **Purpose:** Videos capture the entire test run, providing a visual record of the test execution and any issues encountered.
- **Location:** Videos are saved in the `test-results/videos` directory.
- **Example:**

  [Video of successful login](./test-results/videos/Successful_login_with_valid_credentials.webm)
