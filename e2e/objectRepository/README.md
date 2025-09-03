# XPath-Based Object Repository

## 🎯 Overview

This object repository uses **XPath locators exclusively** for maximum precision and flexibility in element identification.

## 📁 Structure

```
e2e/objectRepository/
├── locators/
│   └── loginPage.json       # XPath locators for login page
├── testData/
│   └── loginData.json       # Test data (credentials, scenarios)
├── managers/
│   └── XPathRepository.ts   # Repository manager class
└── README.md               # This file
```

## 🔧 Usage Examples

### 1. Basic Element Access

```typescript
import { XPathRepositoryManager } from './managers/XPathRepository';

const xpathRepo = XPathRepositoryManager.getInstance();

// Get XPath for an element
const usernameXPath = xpathRepo.getXPath('loginPage', 'usernameInput');
// Returns: "//input[@id='username']"

// Use in Playwright
const element = page.locator(\`xpath=\${usernameXPath}\`);
await element.fill('username');
```

### 2. Fallback XPath Support

```typescript
try {
  // Try primary XPath
  const xpath = xpathRepo.getXPath('loginPage', 'usernameInput');
  await page.locator(\`xpath=\${xpath}\`).fill('username');
} catch (error) {
  // Use alternate XPath if primary fails
  const altXpath = xpathRepo.getAlternateXPath('loginPage', 'usernameInput');
  await page.locator(\`xpath=\${altXpath}\`).fill('username');
}
```

### 3. Dynamic XPath Patterns

```typescript
// Click any button by text
const buttonXPath = xpathRepo.getDynamicXPath(
  'loginPage', 
  'buttonByText', 
  { text: 'Submit' }
);
// Returns: "//button[contains(text(),'Submit')]"

// Click any link by text
const linkXPath = xpathRepo.getDynamicXPath(
  'loginPage', 
  'linkByText', 
  { text: 'Forgot Password' }
);
// Returns: "//a[contains(text(),'Forgot Password')]"
```

### 4. Element Properties Access

```typescript
// Get complete element information
const element = xpathRepo.getElement('loginPage', 'usernameInput');
console.log(element.description); // "Username input field"
console.log(element.waitStrategy); // "visible"
```

## 📋 JSON Structure Explained

### Element Definition
```json
{
  "usernameInput": {
    "xpath": "//input[@id='username']",           // Primary XPath
    "alternateXpath": "//input[@name='username']", // Fallback XPath
    "description": "Username input field",         // Human readable description
    "waitStrategy": "visible"                      // Wait condition
  }
}
```

### Dynamic XPath Patterns
```json
{
  "xpathPatterns": {
    "buttonByText": "//button[contains(text(),'{text}')]",
    "linkByText": "//a[contains(text(),'{text}')]",
    "elementByAttribute": "//*[@{attribute}='{value}']"
  }
}
```

## 🚀 Benefits

1. **Centralized Locators**: All XPaths in one place
2. **Fallback Support**: Alternate XPaths for reliability
3. **Dynamic Patterns**: Reusable XPath templates
4. **Easy Maintenance**: Update locators without touching code
5. **Team Friendly**: Non-developers can update JSON files
6. **Precise Targeting**: XPath flexibility for complex scenarios

## 🔄 Integration with Page Objects

```typescript
export class LoginPage extends BasePage {
  private xpathRepo = XPathRepositoryManager.getInstance();
  
  async enterUsername(username: string): Promise<void> {
    const xpath = this.xpathRepo.getXPath('loginPage', 'usernameInput');
    await this.page.locator(\`xpath=\${xpath}\`).fill(username);
  }
}
```

## 🎯 XPath Best Practices

1. **Use attributes over text** when possible
2. **Avoid absolute paths** (use // instead of /)
3. **Prefer stable attributes** (id, name, data-testid)
4. **Use contains() for partial matches**
5. **Keep XPaths readable and maintainable**

## 📝 Adding New Elements

1. **Add to JSON file**:
```json
{
  "newElement": {
    "xpath": "//div[@class='new-element']",
    "alternateXpath": "//div[@id='new-element']",
    "description": "Description of new element",
    "waitStrategy": "visible"
  }
}
```

2. **Use in code**:
```typescript
const xpath = xpathRepo.getXPath('loginPage', 'newElement');
await page.locator(\`xpath=\${xpath}\`).click();
```

## 🧪 Testing the Repository

```typescript
// Validate required elements exist
const isValid = xpathRepo.validateElements('loginPage', [
  'usernameInput', 
  'passwordInput', 
  'loginButton'
]);
```
