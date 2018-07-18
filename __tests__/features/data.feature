#@wip
Feature: Create data feature
    This is a feature description
    Second description

#    Background: This is a background step
##    This is a background description
#        Given I'm a given background
##        When I'm a when background
##        Then I would be a when background

    Scenario: a table scenario
    This should be a scenario description
        Given a table step
            | Cucumber     | Cucumis sativus |
            | Burr Gherkin | Cucumis anguria |
        When I'm a scenario when step
        Then I'm a scenario then step
