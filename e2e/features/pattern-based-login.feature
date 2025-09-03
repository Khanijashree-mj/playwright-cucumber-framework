Feature: Pattern-Based Object Repository Login Tests

  Background:
    Given I demonstrate pattern-based approach capabilities
    And I am on the login page using patterns
    And I validate the pattern repository

  @pattern-template
  Scenario: Successful login using template-based approach
    When I enter username "student" using template
    And I enter password "Password123" using template
    And I click the login button using template
    Then I should see the success message using patterns
    And I log pattern repository statistics

  @pattern-dynamic
  Scenario: Login using dynamic pattern-based approach
    When I fill the "username" field with "student" using pattern
    And I fill the "password" field with "Password123" using pattern
    And I click the button with text "Submit" using pattern
    Then I should see the success message using patterns

  @pattern-data-driven
  Scenario: Data-driven login using patterns
    When I perform data-driven login with username "student" and password "Password123"
    Then I should see the success message using patterns

  @pattern-multiple-fields
  Scenario: Fill multiple fields using data table and patterns
    When I fill multiple form fields using patterns:
      | field    | value       | type |
      | username | student     | name |
      | password | Password123 | name |
    And I click the button with text "Submit" using pattern
    Then I should see the success message using patterns

  @pattern-fallback
  Scenario: Complete login with automatic fallback handling
    When I perform complete login with fallbacks using username "student" and password "Password123"
    Then I log cache statistics

  @pattern-error-validation
  Scenario Outline: Pattern-based error validation
    When I fill the "username" field with "<username>" using pattern
    And I fill the "password" field with "<password>" using pattern
    And I click the button with text "Submit" using pattern
    Then I should see <expected_result> using patterns

    Examples:
      | username | password    | expected_result             |
      |          | Password123 | username required error     |
      | student  |             | password required error     |
      |          |             | both fields required error  |

  @pattern-search
  Scenario: Demonstrate pattern search capabilities
    Then I search for patterns containing "input"
    And I search for patterns containing "button"
    And I search for patterns containing "table"

  @pattern-cache
  Scenario: Demonstrate pattern caching
    When I enter username "student" using template
    And I log cache statistics
    When I enter password "Password123" using template
    And I log cache statistics
    Then I clear the pattern cache
    And I log cache statistics

  @pattern-id-based
  Scenario: Login using ID-based patterns
    When I fill the field with id "username" with "student" using pattern
    And I fill the field with id "password" with "Password123" using pattern
    And I click the button with text "Submit" using pattern
    Then I should see the success message using patterns

  @pattern-validation
  Scenario: Repository validation and statistics
    Then I validate the pattern repository
    And I log pattern repository statistics
    When I search for patterns containing "form"
    Then I search for patterns containing "modal"
