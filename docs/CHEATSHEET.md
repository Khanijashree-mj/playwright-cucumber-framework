
# Playwright Cheatsheet

This  provides a comprehensive guide to using Playwright for browser automation and testing. It covers installation, basic and advanced usage, assertions, and more.

## Installation

To install Playwright, run:

```sh
npm install playwright
```

## Basic Usage

### Launching a Browser

```typescript
import { chromium, firefox, webkit, Browser } from 'playwright';

const browser: Browser = await chromium.launch();
```

### Launch Options

```typescript
const browser = await chromium.launch({
  headless: false, // Run in headful mode
  slowMo: 50, // Slow down by 50ms
});
```

### Creating a New Page

```typescript
const page = await browser.newPage();
await page.goto('https://example.com');
```

## Basic Interactions

### Navigation

```typescript
await page.goto('https://example.com');
```

### Clicking an Element

```typescript
await page.click('text=Sign In');
```

### Typing into an Input Field

```typescript
await page.fill('#username', 'myUsername');
```

### Pressing a Key

```typescript
await page.press('#password', 'Enter');
```

## Assertions

### Checking Visibility

```typescript
import { expect } from '@playwright/test';

await expect(page.locator('text=Welcome')).toBeVisible();
```

### Checking URL

```typescript
await expect(page).toHaveURL('https://example.com/dashboard');
```

### Checking Text Content

```typescript
await expect(page.locator('h1')).toHaveText('Welcome to Example');
```

### Checking Attribute

```typescript
await expect(page.locator('input#username')).toHaveAttribute('placeholder', 'Enter your username');
```

### Checking Element Count

```typescript
await expect(page.locator('ul li')).toHaveCount(5);
```

### Checking Class

```typescript
await expect(page.locator('button')).toHaveClass(/btn-primary/);
```

## Waiting for Selectors

```typescript
await page.waitForSelector('text=Welcome');
await page.waitForTimeout(1000); // wait for 1 second
```

## Taking Screenshots

```typescript
await page.screenshot({ path: 'screenshot.png' });
```

## Recording a Video

```typescript
const context = await browser.newContext({
  recordVideo: { dir: './videos/' }
});
const page = await context.newPage();
```

## Handling Alerts

```typescript
page.on('dialog', async dialog => {
  console.log(dialog.message());
  await dialog.accept();
});
```

## Emulating Devices

```typescript
import { devices } from 'playwright';

const iPhone = devices['iPhone 11'];
const context = await browser.newContext({
  ...iPhone,
  locale: 'en-US',
  geolocation: { longitude: 12.492507, latitude: 41.889938 },
  permissions: ['geolocation']
});
```

## Network Interception

```typescript
await page.route('**/api/**', route => {
  route.continue({
    headers: {
      ...route.request().headers(),
      'Authorization': 'Bearer token'
    }
  });
});
```

## Multiple Browser Contexts

```typescript
const context1 = await browser.newContext();
const page1 = await context1.newPage();

const context2 = await browser.newContext();
const page2 = await context2.newPage();
```

## Closing Browser

```typescript
await browser.close();
```

## Playwright Test Runner (Optional)

```typescript
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle('Example Domain');
});
```

## Using Fixtures

```typescript
import { test as base, expect } from '@playwright/test';

type MyFixtures = {
  customPage: Page;
};

const test = base.extend<MyFixtures>({
  customPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  }
});

test('custom test', async ({ customPage }) => {
  await customPage.goto('https://example.com');
  await expect(customPage).toHaveTitle('Example Domain');
});
```

## Additional Assertions

### Checking CSS Property

```typescript
await expect(page.locator('button')).toHaveCSS('background-color', 'rgb(255, 0, 0)');
```

### Checking Element State

```typescript
await expect(page.locator('input')).toBeDisabled();
await expect(page.locator('button')).toBeEnabled();
await expect(page.locator('input[type="checkbox"]')).toBeChecked();
```

### Checking Element Visibility

```typescript
await expect(page.locator('div.hidden')).toBeHidden();
```

### Checking Element Focus

```typescript
await expect(page.locator('input#username')).toBeFocused();
```

### Checking Inner Text

```typescript
await expect(page.locator('div#message')).toContainText('Success');
```

### Checking Element Count with Dynamic Content

```typescript
await page.click('button#loadMore');
await expect(page.locator('ul li')).toHaveCount(10); // assuming the list doubles in size
```

## Conclusion

This cheatsheet covers the basic and some advanced features of Playwright. For more detailed information, refer to the [official Playwright documentation](https://playwright.dev/docs/intro).
