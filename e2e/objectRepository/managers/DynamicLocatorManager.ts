import * as fs from 'fs';
import * as path from 'path';

/**
 * Dynamic Locator Manager - XPath-Based Object Repository
 * 
 * This manager handles XPath locators exclusively:
 * - Pattern-based XPath templates with parameter substitution
 * - Page element definitions with fallback mechanisms
 * - Static XPath locators for direct access
 * 
 * All locators returned are XPath expressions for Playwright
 */
export class DynamicLocatorManager {
  private static instance: DynamicLocatorManager;
  private repository: any = null;

  private constructor() {}

  public static getInstance(): DynamicLocatorManager {
    if (!DynamicLocatorManager.instance) {
      DynamicLocatorManager.instance = new DynamicLocatorManager();
    }
    return DynamicLocatorManager.instance;
  }

  /**
   * Load pattern repository from JSON file
   */
  public loadRepository(fileName: string): void {
    const filePath = path.join(__dirname, '..', fileName.endsWith('.json') ? fileName : `${fileName}.json`);
    
    try {
      const jsonData = fs.readFileSync(filePath, 'utf8');
      this.repository = JSON.parse(jsonData);
      console.log(`✅ Pattern repository loaded: ${fileName}`);
    } catch (error) {
      console.error(`❌ Failed to load repository: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Build XPath locator from simple page element path (e.g., "loginPage.usernameField")
   */
  public buildFromTemplate(templatePath: string): { locator: string; patternUsed: string; fallbackUsed: boolean } {
    if (!this.repository) {
      this.loadRepository('patterns');
    }

    const pathParts = templatePath.split('.');
    const pageSection = pathParts[0]; // e.g., 'loginPage'
    const elementName = pathParts[1];  // e.g., 'usernameField'

    // Try simple page structure first
    const simpleLocator = this.repository.pages?.[pageSection]?.[elementName];
    
    if (simpleLocator) {
      return {
        locator: simpleLocator,
        patternUsed: 'direct-xpath',
        fallbackUsed: false
      };
    }

    throw new Error(`Page element not found: ${templatePath}. Available pages: ${Object.keys(this.repository.pages || {}).join(', ')}`);
  }

  /**
   * Build XPath locator using pattern directly
   */
  public buildLocator(patternKey: string, parameters: Record<string, string>): { locator: string; patternUsed: string } {
    if (!this.repository) {
      this.loadRepository('patterns');
    }

    const pathParts = patternKey.split('.');
    const category = pathParts[0];    // e.g., 'input'
    const patternName = pathParts[1]; // e.g., 'byName'

    const pattern = this.repository.xpathPatterns?.[category]?.[patternName];
    
    if (!pattern) {
      throw new Error(`XPath pattern not found: ${patternKey}`);
    }

    const xpathLocator = this.replaceParameters(pattern, parameters);
    return {
      locator: xpathLocator,
      patternUsed: patternKey
    };
  }

  /**
   * Get static XPath element
   */
  public getStaticElement(elementPath: string): { locator: string; patternUsed: string } {
    if (!this.repository) {
      this.loadRepository('patterns');
    }

    const pathParts = elementPath.split('.');
    const section = pathParts[0];     // e.g., 'login'
    const elementName = pathParts[1]; // e.g., 'successMessage'

    const xpathLocator = this.repository.staticXPaths?.[section]?.[elementName];
    
    if (!xpathLocator) {
      throw new Error(`Static XPath element not found: ${elementPath}`);
    }

    return {
      locator: xpathLocator,
      patternUsed: 'static-xpath'
    };
  }

  /**
   * Get XPath locator directly (convenience method)
   * This method automatically prepends 'xpath=' for Playwright compatibility
   */
  public getXPathLocator(elementPath: string): string {
    const result = this.buildFromTemplate(elementPath);
    return `xpath=${result.locator}`;
  }

  /**
   * Get static XPath locator directly (convenience method)
   * This method automatically prepends 'xpath=' for Playwright compatibility
   */
  public getStaticXPathLocator(elementPath: string): string {
    const result = this.getStaticElement(elementPath);
    return `xpath=${result.locator}`;
  }

  /**
   * Replace parameters in XPath pattern
   */
  private replaceParameters(pattern: string, parameters: Record<string, string>): string {
    let result = pattern;
    
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return result;
  }
}
