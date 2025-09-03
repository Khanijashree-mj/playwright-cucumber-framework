Feature: Simple Login Tests
  Clean step definitions that delegate to implementation classes

  @simple-login1
  Scenario: Successful login with simple steps
    Given I am on the login page
    When I login with username "khanijashree.mj@ringcentral.com.gci" and password "Khani@2412"
   # Then I should see login success

  