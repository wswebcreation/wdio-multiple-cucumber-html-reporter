Feature: Create scenario outline feature
    This is a feature description
    Second description

    Scenario Outline: a scenario outline header1:<header1> and header2:<header2>
        Given an outline <header1> step
        And an outline <header2> step

        Examples:
            | header1   | header2 |
            | outline 1 | value1  |
            | outline 2 | value2  |
