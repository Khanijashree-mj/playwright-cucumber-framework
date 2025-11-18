Feature: Quote creation workflow
  Data-driven tests using Scenario Outline with Examples for different countries

  @country-examples
  Scenario Outline: Create lead with different countries and environments
    Given User navigate to the "<environment>" login page
    When User login as "<user>"
    And User create lead with country "<country>"
    And User convert it to "opportunity"
    And User create new "sales quote"
    And User select packages "<package1>", "<package2>" and "<package3>" for country "<country>"
    And User successfully created the quote
    Then User Signup the account

    @us
    Examples:
      | country | environment | user           | package1                                         | package2      | package3           |
      | UK      | GCI         | gciUser        |Office-RingEX Premium                             |               |                    |
      | US      | GCI         | gciUser        |Engage Digital Standalone-concurrent seat based   |               |                    |
      | US      | GCI         | gciUser        |Engage Voice Standalone-RingCX Standard Concurrent|               | Office-RingEX Core |                        
     # | CA      | BISUAT      | bisuatUser     |Events-RingCentral Events Pro+                    |               |                    |
     # | AU      | Proservira  | ProserviraUser |RingCentral Contact Center-Ultimate Edition       |               |                    |
    #  | IN      | GCI         | gciUser        |Professional Services-                            |               | Office-RingEX Premium                  |
  