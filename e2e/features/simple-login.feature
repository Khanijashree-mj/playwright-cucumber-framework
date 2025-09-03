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