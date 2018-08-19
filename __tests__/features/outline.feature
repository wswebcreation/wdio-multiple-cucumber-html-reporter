Feature: Create scenario outline feature
    This is a feature description
    Second description

    Scenario Outline: a scenario outline key:<key>
        Given an outline <key> step
        When I'm a scenario when step
        Then I'm a scenario then step

        Examples:
            | key       |
            | outline 1 |
            | outline 2 |
