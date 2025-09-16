Feature: Example-Driven Lead Creation Tests
  Data-driven tests using Scenario Outline with Examples for different countries

  @country-examples
  Scenario Outline: Create lead with different countries and environments
    Given I navigate to the "<environment>" login page
    When I login as "validUser"
    And I create lead with country "<country>"
    And convert it to "opportunity"

    # @us
    # Examples:
    #   | country | environment |
    #   | US      | GCI         |

    @uk
    Examples:
      | country | environment |
      | UK      | BISUAT      |

    # @canada
    # Examples:
    #   | country | environment |
    #   | CA      | BISUAT      |

    # @australia
    # Examples:
    #   | country | environment |
    #   | AU      | GCI         |

    # @india
    # Examples:
    #   | country | environment |
    #   | IN      | Dev         |