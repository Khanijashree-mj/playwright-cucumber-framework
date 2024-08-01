Feature: User Authentication

  Background:
    Given the user is on the login page

  Scenario: Successful login with valid credentials
    When the user enters the username "student"
    And the user enters the password "Password123"
    And the user clicks on the login button
    Then the user should see a success message

  Scenario: Unsuccessful login with missing username
    When the user enters the username ""
    And the user enters the password "Test@123"
    And the user clicks on the login button
    Then the login attempt should fail
    And the user should see a username required error

  Scenario: Unsuccessful login with missing password
    When the user enters the username "student"
    And the user enters the password ""
    And the user clicks on the login button
    Then the login attempt should fail
    And the user should see a password required error

  Scenario: Unsuccessful login with missing username and password
    When the user enters the username ""
    And the user enters the password ""
    And the user clicks on the login button
    Then the login attempt should fail
    And the user should see a username and password required error