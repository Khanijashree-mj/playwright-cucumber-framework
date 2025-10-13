Feature: Example-Driven Lead Creation Tests
  Data-driven tests using Scenario Outline with Examples for different countries

  @country-examples
  Scenario Outline: Create lead with different countries and environments
    Given I navigate to the "<environment>" login page
    When I login as "validUser"
    And I create lead with country "<country>"
    And I convert it to "opportunity"
    And I create new "sales quote"
    And I select packages "<package1>" and "<package2>"

    @us
    Examples:
    | country | environment | package1              | package2                                       |
    | US      | RingCXdev         | Office-RingEX Premium | Contact Centre-Digital Edition Named Seat (USD)| 


    #
     # | country | environment | Office_package_name     | CC_package_name                 | EV_package_name         | ED_package_name                                      | PS_package_name      | Events_package_name    |
      #| US      | GCI         | RingEX Premium          | Digital Edition Named Seat (USD)| RingCX Named Seats (USD)| Engage Digital Standalone concurrent seat based (USD)| Professional Services| RingCentral Events Pro+|


    # @uk
    # Examples:
    #   | country | environment | package_name           |
    #   | UK      | BISUAT      | RingEX Core          |

    # @canada  
    # Examples:
    #   | country | environment | package_name           |
    #   | CA      | BISUAT      | RingEX Advanced        |

    # @australia
    # Examples:
    #   | country | environment | package_name           |
    #   | AU      | GCI         | RingEX Enterprise      |

    # @multiple-packages
    # Examples:
    #   | country | environment | package_name           |
    #   | US      | GCI         | RingEX Core™          |
    #   | US      | GCI         | RingEX Premium         |
    #   | US      | GCI         | RingEX Advanced        |