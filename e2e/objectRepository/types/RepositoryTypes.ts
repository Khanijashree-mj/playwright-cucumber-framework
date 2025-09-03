// Repository type definitions for JSON-based object repository

export interface LocatorStrategy {
  locatorType: 'css' | 'xpath' | 'getByLabel' | 'getByRole' | 'getByText' | 'getByPlaceholder' | 'getById' | 'getByTestId';
  selector: string;
  options?: {
    name?: string;
    exact?: boolean;
    level?: number;
    hasText?: string;
  };
}

export interface ElementDefinition {
  primary: LocatorStrategy;
  fallback?: LocatorStrategy;
  description: string;
}

export interface PageDefinition {
  url: string;
  title: string;
  loadTimeout: number;
}

export interface ObjectRepository {
  page: PageDefinition;
  elements: Record<string, ElementDefinition>;
  errorMessages: Record<string, string>;
}

export interface TestCredentials {
  username: string;
  password: string;
  expectedError?: string;
}

export interface TestScenario {
  description: string;
  credentials: string;
  expectedOutcome: 'success' | 'error';
}

export interface Environment {
  baseUrl: string;
  timeout: number;
}

export interface TestDataRepository {
  validCredentials: Record<string, TestCredentials>;
  invalidCredentials: Record<string, TestCredentials>;
  testScenarios: Record<string, TestScenario>;
  environments: Record<string, Environment>;
}

export type LocatorResult = {
  selector: string;
  strategy: LocatorStrategy;
  description: string;
};
