Feature: Login and Verification Detection Test
  Simple test to verify the framework can successfully login and detect verification requirements

  @verification-test
  Scenario: Verify login process and identity verification detection
    Given I navigate to the "GCI" environment for verification test
    When I perform login for verification test
    Then I should detect if verification is required
    And the test framework should provide clear feedback