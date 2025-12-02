import * as testData from '../testData/testData.json';

/**
 * TestDataManager - Clean implementation with only methods used by the feature file
 */
export class TestDataManager {
  private static instance: TestDataManager;
  private data: any;

  private constructor() {
    this.data = testData;
  }

  public static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  // =============================================================================
  // USER DATA ACCESS
  // =============================================================================

  /**
   * Get user credentials by user type
   * @param userType - 'validUser', 'invalidUser', 'adminUser', etc.
   */
  public getUser(userType: string): { username: string; password: string; description: string } {
    const user = this.data.users[userType];
    if (!user) {
      throw new Error(`User type '${userType}' not found. Available: ${Object.keys(this.data.users).join(', ')}`);
    }
    return user;
  }

  /**
   * Auto-fetch user credentials based on environment
   * @param environment - 'GCI', 'Dev', 'BISUAT', 'RingCXdev'
   */
  public getUserByEnvironment(environment: string): { username: string; password: string; description: string } {
    const envToUserMapping: { [key: string]: string } = {
      'GCI': 'gciUser',
      'Dev': 'devUser', 
      'BISUAT': 'bisuatUser',
      'RingCXdev': 'RingCXdev'
    };

    const userType = envToUserMapping[environment];
    if (!userType) {
      throw new Error(`No user mapping found for environment '${environment}'. Available: ${Object.keys(envToUserMapping).join(', ')}`);
    }

    return this.getUser(userType);
  }

  // =============================================================================
  // FORM DATA ACCESS
  // =============================================================================

  /**
   * Get form configuration data
   * @param formType - 'leadform', 'registrationForm', etc.
   */
  public getTestData(formType: string): any {
    const form = this.data.forms[formType];
    if (!form) {
      throw new Error(`Form type '${formType}' not found. Available: ${Object.keys(this.data.forms).join(', ')}`);
    }
    return form;
  }

  // =============================================================================
  // ADDRESS DATA ACCESS
  // =============================================================================

  /**
   * Get address data by country
   * @param country - 'US', 'UK', 'CA', 'AU', 'IN'
   */
  public getAddressData(country: string): any {
    const address = this.data.Address[country];
    if (!address) {
      throw new Error(`Address for country '${country}' not found. Available: ${Object.keys(this.data.Address).join(', ')}`);
    }
    return address;
  }

  // =============================================================================
  // URL DATA ACCESS
  // =============================================================================

  /**
   * Get environment URL by environment name
   * @param environment - 'Dev', 'GCI', 'BISUAT'
   */
  public getEnvironmentUrl(environment: string): string {
    const envUrl = this.data.urls.env[environment];
    if (!envUrl) {
      throw new Error(`Environment '${environment}' not found. Available: ${Object.keys(this.data.urls.env).join(', ')}`);
    }
    return envUrl;
  }
}