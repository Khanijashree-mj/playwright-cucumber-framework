# 🎯 Pattern-Based Object Repository - Complete Usage Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Pattern Categories](#pattern-categories)
4. [Usage Methods](#usage-methods)
5. [Advanced Features](#advanced-features)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Pattern-Based Object Repository is a **dynamic, maintainable, and scalable** approach to managing locators in your test automation framework. Instead of hardcoding individual locators, you define **reusable patterns** that can be dynamically generated with parameters.

### ✅ Key Benefits:
- **90% reduction** in locator maintenance
- **Dynamic locator generation** for data-driven testing
- **Automatic fallback** support for reliability
- **Template-based** approach for common scenarios
- **Centralized pattern management** for team collaboration

## 🚀 Quick Start

### 1. **Initialize the Pattern Manager**
```typescript
import { DynamicLocatorManager } from './managers/DynamicLocatorManager';

const locatorManager = DynamicLocatorManager.getInstance();
locatorManager.loadRepository('7-pattern-based');
```

### 2. **Basic Pattern Usage**
```typescript
// Generate a locator from a pattern
const result = locatorManager.buildLocator('basic.inputByName', { name: 'username' });
await page.locator(`xpath=${result.locator}`).fill('user123');
// Generated: //input[@name='username']
```

### 3. **Template Usage (Recommended)**
```typescript
// Use predefined templates with fallback support
const result = locatorManager.buildFromTemplate('loginPage.usernameField');
await page.locator(`xpath=${result.locator}`).fill('user123');
// Template automatically provides fallback if primary pattern fails
```

### 4. **Static Element Usage**
```typescript
// Use static elements for fixed locators
const result = locatorManager.getStaticElement('login.errorMessage');
await page.locator(`xpath=${result.locator}`).isVisible();
```

## 📚 Pattern Categories

### 🔹 **1. Basic Patterns** (`basic.*`)
Simple element identification patterns:

```typescript
// Input fields
locatorManager.buildLocator('basic.inputByName', { name: 'username' });
locatorManager.buildLocator('basic.inputById', { id: 'email-input' });
locatorManager.buildLocator('basic.inputByPlaceholder', { placeholder: 'Enter email' });

// Buttons
locatorManager.buildLocator('basic.buttonByText', { text: 'Submit' });
locatorManager.buildLocator('basic.buttonById', { id: 'login-btn' });

// Links
locatorManager.buildLocator('basic.linkByText', { text: 'Forgot Password' });
locatorManager.buildLocator('basic.linkByHref', { href: '/reset-password' });

// Generic elements
locatorManager.buildLocator('basic.elementByAttribute', { 
  attribute: 'data-testid', 
  value: 'login-form' 
});
```

### 🔹 **2. Form Patterns** (`form.*`)
Advanced form interaction patterns:

```typescript
// Label-based field selection
locatorManager.buildLocator('form.fieldByLabel', { label: 'Email Address' });
// Result: //label[contains(text(),'Email Address')]/following-sibling::input

// Dropdown interactions
locatorManager.buildLocator('form.optionByText', { 
  name: 'country', 
  option: 'United States' 
});
// Result: //select[@name='country']/option[text()='United States']

// Checkbox and radio buttons
locatorManager.buildLocator('form.checkboxByName', { name: 'terms-agree' });
locatorManager.buildLocator('form.radioByValue', { value: 'premium-plan' });
```

### 🔹 **3. Table Patterns** (`table.*`)
Dynamic table data handling:

```typescript
// Specific cell access
locatorManager.buildLocator('table.tableCell', { row: '2', column: '3' });
// Result: //table//tr[2]//td[3]

// Find row by content
locatorManager.buildLocator('table.rowByText', { text: 'John Doe' });
// Result: //table//tr[td[contains(text(),'John Doe')]]

// Get cell in specific row
locatorManager.buildLocator('table.cellInRowByText', { 
  rowText: 'John Doe', 
  column: '3' 
});
// Result: //table//tr[td[contains(text(),'John Doe')]]//td[3]

// Header-based cell finding
locatorManager.buildLocator('table.tableCellByHeaderText', { 
  headerText: 'Email', 
  row: '2' 
});
```

### 🔹 **4. Navigation Patterns** (`navigation.*`)
Menu and navigation handling:

```typescript
// Menu items
locatorManager.buildLocator('navigation.menuItemByText', { text: 'Products' });

// Multi-level menus
locatorManager.buildLocator('navigation.menuItemByLevel', { 
  level: '2', 
  menuText: 'Sub Menu' 
});

// Breadcrumbs
locatorManager.buildLocator('navigation.breadcrumbByText', { text: 'Dashboard' });

// Tabs
locatorManager.buildLocator('navigation.tabByText', { text: 'Settings' });
```

### 🔹 **5. List Patterns** (`list.*`)
List and item handling:

```typescript
// List items by text
locatorManager.buildLocator('list.listItemByText', { text: 'Item 1' });

// List items by position
locatorManager.buildLocator('list.listItemByPosition', { position: '3' });

// Nested lists
locatorManager.buildLocator('list.nestedListItem', { 
  parentText: 'Category A', 
  childText: 'Sub-item 1' 
});
```

### 🔹 **6. Modal Patterns** (`modal.*`)
Modal and dialog handling:

```typescript
// Modal by title
locatorManager.buildLocator('modal.modalByTitle', { title: 'Confirm Delete' });

// Modal buttons
locatorManager.buildLocator('modal.modalButton', { text: 'Yes, Delete' });

// Close modal
locatorManager.buildLocator('modal.modalClose', {});
```

## 🛠️ Usage Methods

### **Method 1: Template Usage (Recommended)**

Templates provide the **highest level of abstraction** with built-in fallback support:

```typescript
// In your page object
export class LoginPage {
  private locatorManager = DynamicLocatorManager.getInstance();
  
  async enterUsername(username: string): Promise<void> {
    // Use template - automatically handles fallbacks
    const result = this.locatorManager.buildFromTemplate('loginPage.usernameField');
    const element = this.page.locator(`xpath=${result.locator}`);
    
    await element.waitFor({ state: 'visible' });
    await element.fill(username);
    
    console.log(`✅ Used: ${result.patternUsed}${result.fallbackUsed ? ' (fallback)' : ''}`);
  }
}
```

**Template Definition in JSON:**
```json
{
  "templates": {
    "loginPage": {
      "usernameField": {
        "pattern": "basic.inputByName",
        "params": { "name": "username" },
        "fallback": {
          "pattern": "basic.inputById", 
          "params": { "id": "username" }
        }
      }
    }
  }
}
```

### **Method 2: Direct Pattern Usage**

For maximum flexibility and custom parameters:

```typescript
// Custom parameters for specific scenarios
async fillDynamicField(fieldName: string, value: string): Promise<void> {
  const result = this.locatorManager.buildLocator('basic.inputByName', { 
    name: fieldName 
  });
  
  await this.page.locator(`xpath=${result.locator}`).fill(value);
}

// Data-driven approach
const fieldData = [
  { pattern: 'basic.inputByName', params: { name: 'firstName' } },
  { pattern: 'basic.inputByName', params: { name: 'lastName' } },
  { pattern: 'basic.inputByName', params: { name: 'email' } }
];

const results = this.locatorManager.buildMultipleLocators(
  'basic.inputByName', 
  fieldData.map(item => item.params)
);
```

### **Method 3: Complex Pattern Usage**

For advanced scenarios with complex XPath requirements:

```typescript
// Use complex patterns for special cases
async verifyVisibleButton(buttonText: string): Promise<void> {
  const result = this.locatorManager.buildComplexLocator(
    'conditionalElements.visibleButton', 
    { text: buttonText }
  );
  
  const element = this.page.locator(`xpath=${result.locator}`);
  await expect(element).toBeVisible();
}

// Hierarchical element finding
async findFormFieldInGroup(groupName: string, fieldName: string): Promise<void> {
  const result = this.locatorManager.buildComplexLocator(
    'hierarchicalElements.formFieldInGroup',
    { groupName, fieldName }
  );
  
  return this.page.locator(`xpath=${result.locator}`);
}
```

### **Method 4: Static Element Usage**

For elements that never change:

```typescript
async verifyErrorMessage(): Promise<void> {
  const result = this.locatorManager.getStaticElement('login.errorMessage');
  const element = this.page.locator(`xpath=${result.locator}`);
  await expect(element).toBeVisible();
}
```

## 🔬 Advanced Features

### **1. Data-Driven Testing**

Perfect for handling multiple test data sets:

```typescript
// Test multiple users
const testUsers = [
  { name: 'john.doe', email: 'john@example.com' },
  { name: 'jane.smith', email: 'jane@example.com' },
  { name: 'admin.user', email: 'admin@example.com' }
];

// Generate locators for all users
const userRowLocators = this.locatorManager.buildMultipleLocators(
  'table.rowByText', 
  testUsers.map(user => ({ text: user.name }))
);

// Verify all users exist in table
for (const locatorResult of userRowLocators) {
  const element = this.page.locator(`xpath=${locatorResult.locator}`);
  await expect(element).toBeVisible();
}
```

### **2. Fallback Chain Handling**

Templates automatically handle fallback chains:

```json
{
  "templates": {
    "loginPage": {
      "submitButton": {
        "pattern": "basic.buttonByText",
        "params": { "text": "Sign In" },
        "fallback": {
          "pattern": "basic.buttonById",
          "params": { "id": "submit-btn" }
        }
      }
    }
  }
}
```

```typescript
// Automatically tries primary pattern, then fallback if needed
const result = this.locatorManager.buildFromTemplate('loginPage.submitButton');
// Will try: //button[contains(text(),'Sign In')]
// If fails: //button[@id='submit-btn']
```

### **3. Pattern Validation**

Ensure your repository is healthy:

```typescript
// Validate the entire repository
const validation = this.locatorManager.validateRepository();

if (!validation.isValid) {
  console.error('❌ Repository validation failed:');
  console.error('Missing patterns:', validation.missingPatterns);
  console.error('Errors:', validation.errors);
  console.error('Warnings:', validation.warnings);
}

// Get repository statistics
const stats = this.locatorManager.getRepositoryStats();
console.log('📊 Repository loaded:', stats.metadata);
console.log('📊 Pattern counts:', stats.patternCounts);
console.log('📊 Cache stats:', stats.cacheStats);
```

### **4. Pattern Search and Discovery**

Find patterns by content:

```typescript
// Search for patterns containing specific text
const results = this.locatorManager.searchPatterns('button');

results.forEach(result => {
  console.log(`Pattern: ${result.path}`);
  console.log(`XPath: ${result.pattern}`);
  console.log(`Category: ${result.category}`);
});
```

## 📋 Best Practices

### **✅ DO:**

1. **Use Templates for Common Scenarios**
   ```typescript
   // ✅ Good - Use templates with fallbacks
   const result = this.locatorManager.buildFromTemplate('loginPage.usernameField');
   ```

2. **Group Related Patterns**
   ```json
   {
     "patterns": {
       "form": {
         "inputByName": "//input[@name='{name}']",
         "inputById": "//input[@id='{id}']",
         "selectByName": "//select[@name='{name}']"
       }
     }
   }
   ```

3. **Use Descriptive Parameter Names**
   ```typescript
   // ✅ Good - Clear parameter names
   buildLocator('table.cellInRowByText', { 
     rowText: 'John Doe', 
     column: 'email' 
   });
   ```

4. **Validate Patterns During Development**
   ```typescript
   // ✅ Good - Always validate in development
   if (process.env.NODE_ENV === 'development') {
     const validation = this.locatorManager.validateRepository();
     if (!validation.isValid) {
       throw new Error('Repository validation failed');
     }
   }
   ```

### **❌ DON'T:**

1. **Don't Hardcode Locators**
   ```typescript
   // ❌ Bad - Hardcoded locator
   await page.locator("//input[@name='username']").fill(username);
   
   // ✅ Good - Pattern-based locator
   const result = locatorManager.buildLocator('basic.inputByName', { name: 'username' });
   await page.locator(`xpath=${result.locator}`).fill(username);
   ```

2. **Don't Create Overly Complex Patterns**
   ```json
   // ❌ Bad - Too complex
   "complexPattern": "//div[contains(@class,'container')]//form[@id='login']//div[contains(@class,'field-group')]//input[@name='{name}' and @type='{type}' and not(@disabled)]"
   
   // ✅ Good - Simple and focused
   "enabledInputByName": "//input[@name='{name}' and not(@disabled)]"
   ```

3. **Don't Ignore Fallback Mechanisms**
   ```typescript
   // ❌ Bad - No fallback handling
   const result = locatorManager.buildLocator('basic.buttonByText', { text: 'Submit' });
   // What if button text changes?
   
   // ✅ Good - Use templates with fallbacks
   const result = locatorManager.buildFromTemplate('loginPage.submitButton');
   ```

## 🐛 Troubleshooting

### **Common Issues and Solutions:**

#### **1. Pattern Not Found Error**
```
❌ Error: Pattern not found: basic.inputByNam
```

**Solution:**
- Check pattern spelling in repository
- Verify pattern category exists
- Use `searchPatterns()` to find available patterns

```typescript
// Debug available patterns
const patterns = locatorManager.searchPatterns('input');
console.log('Available input patterns:', patterns);
```

#### **2. Unreplaced Parameters Warning**
```
⚠️ Unreplaced parameters found: {userName}
```

**Solution:**
- Ensure all required parameters are provided
- Check parameter names match exactly
- Use template validation

```typescript
// ✅ Correct - All parameters provided
locatorManager.buildLocator('table.rowByText', { text: 'John Doe' });

// ❌ Incorrect - Missing parameter
locatorManager.buildLocator('table.rowByText', {}); // Missing 'text' parameter
```

#### **3. Template Fallback Not Working**

**Solution:**
- Verify fallback pattern exists
- Check fallback parameters are correct
- Enable debug logging

```typescript
// Enable debug mode
console.log('Repository stats:', locatorManager.getRepositoryStats());
const validation = locatorManager.validateRepository();
console.log('Validation result:', validation);
```

#### **4. Cache Issues**

**Solution:**
- Clear cache if patterns are updated
- Disable cache during development

```typescript
// Clear cache
locatorManager.clearCache();

// Disable cache for development
locatorManager.setCacheEnabled(false);
```

## 📈 Performance Tips

### **1. Enable Caching in Production**
```typescript
// Production - Enable caching
locatorManager.setCacheEnabled(true);

// Development - Disable for fresh patterns
locatorManager.setCacheEnabled(false);
```

### **2. Use Templates for Repeated Patterns**
```typescript
// ✅ Efficient - Template reuse
for (let i = 0; i < users.length; i++) {
  const result = locatorManager.buildFromTemplate('userTable.userRow', { 
    userName: users[i].name 
  });
  // Template cached after first use
}
```

### **3. Batch Multiple Locators**
```typescript
// ✅ Efficient - Batch processing
const results = locatorManager.buildMultipleLocators(
  'basic.inputByName',
  [{ name: 'field1' }, { name: 'field2' }, { name: 'field3' }]
);
```

## 🎯 Summary

The Pattern-Based Object Repository provides:

- **🎯 90% reduction** in locator maintenance
- **🔄 Dynamic locator** generation
- **🛡️ Automatic fallback** support  
- **📊 Data-driven** testing capabilities
- **🔍 Pattern search** and validation
- **⚡ Performance optimization** through caching
- **👥 Team collaboration** through JSON-based patterns

Start with **templates** for common scenarios, use **direct patterns** for flexibility, and leverage **complex patterns** for advanced cases. Always validate your repository and use fallbacks for reliability!
