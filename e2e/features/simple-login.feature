Feature: Example-Driven Lead Creation Tests
  Data-driven tests using Scenario Outline with Examples for different countries

  @country-examples
  Scenario Outline: Create lead with different countries and environments
    Given I navigate to the "<environment>" login page
    When I login as "validUser"
    And I create lead with country "<country>"
    And I convert it to "opportunity"
    And I create new "sales quote"
    And I select package "<Office_package_name>"

    @us
    Examples:
      | country | environment | Office_package_name           |
        | US      | GCI         | RingEX Core          |

    # @uk
    # Examples:
    #   | country | environment | package_name           |
    #   | UK      | BISUAT      | RingEX Premium         |

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