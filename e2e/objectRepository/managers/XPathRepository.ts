import * as fs from 'fs';
import * as path from 'path';

export interface XPathElement {
  xpath: string;
  alternateXpath?: string;
  description: string;
  waitStrategy: 'visible' | 'clickable' | 'present' | 'hidden';
}

export interface XPathRepository {
  page: {
    url: string;
    title: string;
    loadTimeout: number;
  };
  elements: Record<string, XPathElement>;
  xpathPatterns: Record<string, string>;
  errorMessages: Record<string, string>;
  waitStrategies: Record<string, string>;
}

export class XPathRepositoryManager {
  private static instance: XPathRepositoryManager;
  private repositories: Map<string, XPathRepository> = new Map();

  private constructor() {}

  public static getInstance(): XPathRepositoryManager {
    if (!XPathRepositoryManager.instance) {
      XPathRepositoryManager.instance = new XPathRepositoryManager();
    }
    return XPathRepositoryManager.instance;
  }

  /**
   * Load XPath repository from JSON file
   */
  public loadRepository(fileName: string): XPathRepository {
    if (this.repositories.has(fileName)) {
      return this.repositories.get(fileName)!;
    }

    const filePath = path.join(
      __dirname, 
      '../locators', 
      fileName.endsWith('.json') ? fileName : `${fileName}.json`
    );

    try {
      const jsonData = fs.readFileSync(filePath, 'utf8');
      const repository: XPathRepository = JSON.parse(jsonData);
      this.repositories.set(fileName, repository);
      return repository;
    } catch (error) {
      throw new Error(`Failed to load repository file: ${filePath}. Error: ${error}`);
    }
  }

  /**
   * Get XPath for a specific element
   */
  public getXPath(repositoryName: string, elementName: string): string {
    const repo = this.loadRepository(repositoryName);
    const element = repo.elements[elementName];
    
    if (!element) {
      throw new Error(`Element '${elementName}' not found in repository '${repositoryName}'`);
    }
    
    return element.xpath;
  }

  /**
   * Get alternate XPath for fallback scenarios
   */
  public getAlternateXPath(repositoryName: string, elementName: string): string {
    const repo = this.loadRepository(repositoryName);
    const element = repo.elements[elementName];
    
    if (!element || !element.alternateXpath) {
      throw new Error(`Alternate XPath for '${elementName}' not found in repository '${repositoryName}'`);
    }
    
    return element.alternateXpath;
  }

  /**
   * Get element with all properties
   */
  public getElement(repositoryName: string, elementName: string): XPathElement {
    const repo = this.loadRepository(repositoryName);
    const element = repo.elements[elementName];
    
    if (!element) {
      throw new Error(`Element '${elementName}' not found in repository '${repositoryName}'`);
    }
    
    return element;
  }

  /**
   * Get dynamic XPath using patterns
   */
  public getDynamicXPath(
    repositoryName: string, 
    patternName: string, 
    replacements: Record<string, string>
  ): string {
    const repo = this.loadRepository(repositoryName);
    const pattern = repo.xpathPatterns[patternName];
    
    if (!pattern) {
      throw new Error(`XPath pattern '${patternName}' not found in repository '${repositoryName}'`);
    }
    
    let xpath = pattern;
    Object.entries(replacements).forEach(([key, value]) => {
      xpath = xpath.replace(`{${key}}`, value);
    });
    
    return xpath;
  }

  /**
   * Get page configuration
   */
  public getPageConfig(repositoryName: string) {
    const repo = this.loadRepository(repositoryName);
    return repo.page;
  }

  /**
   * Get error message
   */
  public getErrorMessage(repositoryName: string, errorKey: string): string {
    const repo = this.loadRepository(repositoryName);
    const message = repo.errorMessages[errorKey];
    
    if (!message) {
      throw new Error(`Error message '${errorKey}' not found in repository '${repositoryName}'`);
    }
    
    return message;
  }

  /**
   * Get all element names from repository
   */
  public getElementNames(repositoryName: string): string[] {
    const repo = this.loadRepository(repositoryName);
    return Object.keys(repo.elements);
  }

  /**
   * Validate that all required elements exist
   */
  public validateElements(repositoryName: string, requiredElements: string[]): boolean {
    const repo = this.loadRepository(repositoryName);
    const missingElements = requiredElements.filter(
      element => !repo.elements[element]
    );
    
    if (missingElements.length > 0) {
      throw new Error(
        `Missing elements in repository '${repositoryName}': ${missingElements.join(', ')}`
      );
    }
    
    return true;
  }
}
