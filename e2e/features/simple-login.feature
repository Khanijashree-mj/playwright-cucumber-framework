Feature: Simple Login Tests
  Clean step definitions that delegate to implementation classes

  @simple-login
  Scenario: Successful login with simple steps
    Given I am on the login page
    When I login with username "student" and password "Password123"
    Then I should see login success

  @simple-login
  Scenario: Failed login with simple steps
    Given I am on the login page
    When I login with username "invalid" and password "wrong"
    Then I should see login error "invalid-credentials"

  @simple-login
  Scenario: Login using pattern-based approach
    Given I am on the login page
    When I login using patterns with username "student" and password "Password123"
    Then I should see login success

  @simple-login
  Scenario: Login using keyboard approach
    Given I am on the login page
    When I login using keyboard with username "student" and password "Password123"
    Then I should see login success

  @simple-login
  Scenario: Data-driven login
    Given I am on the login page
    When I login with data:
      | username | password    |
      | student  | Password123 |
    Then I should see login success

  @simple-workflow
  Scenario: Complete login workflow in one step
    When I perform complete login as "student" with password "Password123"

  @simple-workflow
  Scenario: Complete failed login workflow in one step
    When I attempt invalid login as "invalid" with password "wrong"

  @simple-workflow
  Scenario: Execute complete login workflow with detailed steps
    When I execute complete login workflow with username "student" and password "Password123"

  @simple-workflow
  Scenario: Execute failed login workflow with detailed steps
    When I execute failed login workflow with username "invalid" and password "wrong"

  @form-operations
  Scenario: Login form operations
    Given I am on the login page
    When I take login screenshot "initial-form"
    And I login with username "student" and password "Password123"
    Then I should see login success
    When I logout
    Then I verify login page is loaded

  @form-validation
  Scenario: Login form validation
    Given I am on the login page
    Then I validate login form accessibility
    When I clear the login form
    Then the login form should be empty

  @multiple-tests
  Scenario: Execute multiple login test cases
    When I execute multiple login tests:
      | username | password    | shouldSucceed | description          |
      | student  | Password123 | true          | Valid credentials    |
      | invalid  | wrong       | false         | Invalid credentials  |
      | student  | wrongpass   | false         | Valid user, bad pass |

  @debug
  Scenario: Debug login page information
    Given I am on the login page
    When I debug current page state
    Then I verify login page is loaded
