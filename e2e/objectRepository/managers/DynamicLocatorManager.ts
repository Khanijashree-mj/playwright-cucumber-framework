import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// INTERFACES AND TYPES
// =============================================================================

export interface PatternRepository {
  patterns: Record<string, Record<string, string>>;
  staticElements: Record<string, Record<string, string>>;
  templates: Record<string, Record<string, TemplateDefinition>>;
  complexPatterns: Record<string, Record<string, string>>;
  validation: {
    requiredPatterns: string[];
    patternGroups: Record<string, string[]>;
  };
  metadata: {
    version: string;
    description: string;
    lastUpdated: string;
    totalPatterns: number;
    categories: string[];
  };
}

export interface TemplateDefinition {
  pattern: string;
  params: Record<string, string>;
  fallback?: {
    pattern: string;
    params: Record<string, string>;
  };
  suffix?: string;
}

export interface LocatorBuildResult {
  locator: string;
  patternUsed: string;
  parametersApplied: Record<string, string>;
  fallbackUsed: boolean;
  description?: string;
}

export interface ValidationResult {
  isValid: boolean;
  missingPatterns: string[];
  errors: string[];
  warnings: string[];
}

// =============================================================================
// DYNAMIC LOCATOR MANAGER CLASS
// =============================================================================

export class DynamicLocatorManager {
  private static instance: DynamicLocatorManager;
  private repository: PatternRepository | null = null;
  private repositoryPath: string = '';
  private cache: Map<string, string> = new Map();
  private cacheEnabled: boolean = true;

  private constructor() {}

  /**
   * Singleton pattern implementation
   */
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
    const filePath = path.join(
      __dirname, 
      '..', 
      fileName.endsWith('.json') ? fileName : `${fileName}.json`
    );

    try {
      const jsonData = fs.readFileSync(filePath, 'utf8');
      this.repository = JSON.parse(jsonData);
      this.repositoryPath = filePath;
      console.log(`✅ Pattern repository loaded: ${fileName}`);
      if (this.repository?.metadata) {
        console.log(`📊 Total patterns: ${this.repository.metadata.totalPatterns}`);
      }
    } catch (error) {
      throw new Error(`❌ Failed to load pattern repository: ${filePath}. Error: ${error}`);
    }
  }

  /**
   * Generate locator from pattern with parameters
   */
  public buildLocator(patternPath: string, parameters: Record<string, string> = {}): LocatorBuildResult {
    if (!this.repository) {
      throw new Error('❌ Pattern repository not loaded. Call loadRepository() first.');
    }

    const cacheKey = `${patternPath}-${JSON.stringify(parameters)}`;
    
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      const cachedLocator = this.cache.get(cacheKey)!;
      return {
        locator: cachedLocator,
        patternUsed: patternPath,
        parametersApplied: parameters,
        fallbackUsed: false,
        description: 'Retrieved from cache'
      };
    }

    const pattern = this.getPattern(patternPath);
    const locator = this.replaceParameters(pattern, parameters);
    
    if (this.cacheEnabled) {
      this.cache.set(cacheKey, locator);
    }

    return {
      locator,
      patternUsed: patternPath,
      parametersApplied: parameters,
      fallbackUsed: false,
      description: `Generated from pattern: ${patternPath}`
    };
  }

  /**
   * Build locator from template with fallback support
   */
  public buildFromTemplate(templatePath: string, runtimeParameters: Record<string, string> = {}): LocatorBuildResult {
    if (!this.repository) {
      throw new Error('❌ Pattern repository not loaded. Call loadRepository() first.');
    }

    const template = this.getTemplate(templatePath);
    
    // Merge template parameters with runtime parameters (runtime takes precedence)
    const allParameters = { ...template.params, ...runtimeParameters };
    
    // Replace any nested parameters in template params
    const resolvedParameters = this.resolveNestedParameters(allParameters, runtimeParameters);

    try {
      // Try primary pattern
      const primaryResult = this.buildLocator(template.pattern, resolvedParameters);
      let finalLocator = primaryResult.locator;
      
      // Add suffix if specified
      if (template.suffix) {
        finalLocator += template.suffix;
      }

      return {
        locator: finalLocator,
        patternUsed: template.pattern,
        parametersApplied: resolvedParameters,
        fallbackUsed: false,
        description: `Template: ${templatePath}`
      };
    } catch (error) {
      // Try fallback if available
      if (template.fallback) {
        console.log(`⚠️ Primary pattern failed, trying fallback for template: ${templatePath}`);
        
        const fallbackParameters = { ...template.fallback.params, ...runtimeParameters };
        const resolvedFallbackParameters = this.resolveNestedParameters(fallbackParameters, runtimeParameters);
        
        const fallbackResult = this.buildLocator(template.fallback.pattern, resolvedFallbackParameters);
        let fallbackLocator = fallbackResult.locator;
        
        if (template.suffix) {
          fallbackLocator += template.suffix;
        }

        return {
          locator: fallbackLocator,
          patternUsed: template.fallback.pattern,
          parametersApplied: resolvedFallbackParameters,
          fallbackUsed: true,
          description: `Template: ${templatePath} (fallback used)`
        };
      }
      
      throw error;
    }
  }

  /**
   * Get static element locator
   */
  public getStaticElement(elementPath: string): LocatorBuildResult {
    if (!this.repository) {
      throw new Error('❌ Pattern repository not loaded.');
    }

    const parts = elementPath.split('.');
    let current: any = this.repository.staticElements;
    
    for (const part of parts) {
      current = current[part];
      if (!current) {
        throw new Error(`❌ Static element not found: ${elementPath}`);
      }
    }

    return {
      locator: current,
      patternUsed: 'static',
      parametersApplied: {},
      fallbackUsed: false,
      description: `Static element: ${elementPath}`
    };
  }

  /**
   * Build multiple locators for data-driven testing
   */
  public buildMultipleLocators(
    patternPath: string, 
    parameterSets: Record<string, string>[]
  ): LocatorBuildResult[] {
    return parameterSets.map((params, index) => {
      try {
        const result = this.buildLocator(patternPath, params);
        return {
          ...result,
          description: `${result.description} (Set ${index + 1})`
        };
      } catch (error) {
        throw new Error(`❌ Failed to build locator for parameter set ${index + 1}: ${error}`);
      }
    });
  }

  /**
   * Build complex locators with chaining
   */
  public buildComplexLocator(complexPatternPath: string, parameters: Record<string, string>): LocatorBuildResult {
    if (!this.repository) {
      throw new Error('❌ Pattern repository not loaded.');
    }

    const complexPattern = this.getComplexPattern(complexPatternPath);
    const locator = this.replaceParameters(complexPattern, parameters);

    return {
      locator,
      patternUsed: `complex.${complexPatternPath}`,
      parametersApplied: parameters,
      fallbackUsed: false,
      description: `Complex pattern: ${complexPatternPath}`
    };
  }

  /**
   * Validate repository and patterns
   */
  public validateRepository(): ValidationResult {
    if (!this.repository) {
      return {
        isValid: false,
        missingPatterns: [],
        errors: ['Repository not loaded'],
        warnings: []
      };
    }

    const result: ValidationResult = {
      isValid: true,
      missingPatterns: [],
      errors: [],
      warnings: []
    };

    // Check required patterns
    for (const requiredCategory of this.repository.validation.requiredPatterns) {
      if (!this.repository.patterns[requiredCategory]) {
        result.missingPatterns.push(requiredCategory);
        result.errors.push(`Missing required pattern category: ${requiredCategory}`);
      }
    }

    // Check pattern groups
    for (const [groupName, patterns] of Object.entries(this.repository.validation.patternGroups)) {
      for (const pattern of patterns) {
        try {
          this.getPattern(pattern);
        } catch (error) {
          result.missingPatterns.push(pattern);
          result.warnings.push(`Pattern in group '${groupName}' not found: ${pattern}`);
        }
      }
    }

    // Validate template patterns
    for (const [templateCategory, templates] of Object.entries(this.repository.templates)) {
      for (const [templateName, template] of Object.entries(templates)) {
        try {
          this.getPattern(template.pattern);
          if (template.fallback) {
            this.getPattern(template.fallback.pattern);
          }
        } catch (error) {
          result.errors.push(`Invalid pattern in template ${templateCategory}.${templateName}: ${error}`);
        }
      }
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Get repository statistics
   */
  public getRepositoryStats(): any {
    if (!this.repository) {
      return null;
    }

    const stats = {
      metadata: this.repository.metadata,
      patternCounts: {} as Record<string, number>,
      templateCounts: {} as Record<string, number>,
      staticElementCounts: {} as Record<string, number>,
      complexPatternCounts: {} as Record<string, number>,
      cacheStats: {
        enabled: this.cacheEnabled,
        size: this.cache.size,
        hitRate: '0%' // Would need actual tracking for real hit rate
      }
    };

    // Count patterns by category
    for (const [category, patterns] of Object.entries(this.repository.patterns)) {
      stats.patternCounts[category] = Object.keys(patterns).length;
    }

    // Count templates by category
    for (const [category, templates] of Object.entries(this.repository.templates)) {
      stats.templateCounts[category] = Object.keys(templates).length;
    }

    // Count static elements by category
    for (const [category, elements] of Object.entries(this.repository.staticElements)) {
      stats.staticElementCounts[category] = Object.keys(elements).length;
    }

    // Count complex patterns by category
    for (const [category, patterns] of Object.entries(this.repository.complexPatterns)) {
      stats.complexPatternCounts[category] = Object.keys(patterns).length;
    }

    return stats;
  }

  /**
   * Search for patterns containing specific text
   */
  public searchPatterns(searchText: string): Array<{ path: string; pattern: string; category: string }> {
    if (!this.repository) {
      return [];
    }

    const results: Array<{ path: string; pattern: string; category: string }> = [];

    // Search in patterns
    for (const [category, patterns] of Object.entries(this.repository.patterns)) {
      for (const [name, pattern] of Object.entries(patterns)) {
        if (pattern.toLowerCase().includes(searchText.toLowerCase()) || 
            name.toLowerCase().includes(searchText.toLowerCase())) {
          results.push({
            path: `${category}.${name}`,
            pattern: pattern,
            category: 'pattern'
          });
        }
      }
    }

    // Search in complex patterns
    for (const [category, patterns] of Object.entries(this.repository.complexPatterns)) {
      for (const [name, pattern] of Object.entries(patterns)) {
        if (pattern.toLowerCase().includes(searchText.toLowerCase()) || 
            name.toLowerCase().includes(searchText.toLowerCase())) {
          results.push({
            path: `${category}.${name}`,
            pattern: pattern,
            category: 'complex'
          });
        }
      }
    }

    return results;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Enable/disable locator caching
   */
  public setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.cache.clear();
    }
  }

  /**
   * Clear the locator cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private getPattern(patternPath: string): string {
    if (!this.repository) {
      throw new Error('❌ Repository not loaded');
    }
    const parts = patternPath.split('.');
    let current: any = this.repository.patterns;
    
    for (const part of parts) {
      current = current[part];
      if (!current) {
        throw new Error(`❌ Pattern not found: ${patternPath}`);
      }
    }
    
    return current;
  }

  private getTemplate(templatePath: string): TemplateDefinition {
    if (!this.repository) {
      throw new Error('❌ Repository not loaded');
    }
    const parts = templatePath.split('.');
    let current: any = this.repository.templates;
    
    for (const part of parts) {
      current = current[part];
      if (!current) {
        throw new Error(`❌ Template not found: ${templatePath}`);
      }
    }
    
    return current;
  }

  private getComplexPattern(complexPatternPath: string): string {
    if (!this.repository) {
      throw new Error('❌ Repository not loaded');
    }
    const parts = complexPatternPath.split('.');
    let current: any = this.repository.complexPatterns;
    
    for (const part of parts) {
      current = current[part];
      if (!current) {
        throw new Error(`❌ Complex pattern not found: ${complexPatternPath}`);
      }
    }
    
    return current;
  }

  private replaceParameters(pattern: string, parameters: Record<string, string>): string {
    let result = pattern;
    
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }
    
    // Check if there are any unreplaced parameters
    const remainingPlaceholders = result.match(/\{[^}]+\}/g);
    if (remainingPlaceholders) {
      console.warn(`⚠️ Unreplaced parameters found: ${remainingPlaceholders.join(', ')}`);
    }
    
    return result;
  }

  private resolveNestedParameters(
    templateParams: Record<string, string>, 
    runtimeParams: Record<string, string>
  ): Record<string, string> {
    const resolved: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(templateParams)) {
      if (value.startsWith('{') && value.endsWith('}')) {
        // This is a nested parameter reference
        const nestedKey = value.slice(1, -1);
        if (runtimeParams[nestedKey]) {
          resolved[key] = runtimeParams[nestedKey];
        } else {
          resolved[key] = value; // Keep as-is if no runtime value
        }
      } else {
        resolved[key] = value;
      }
    }
    
    return resolved;
  }
}
