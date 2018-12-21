Feature: Create ignored undefined feature bassed on issue 16

    @ignore
    Scenario: I ignore this undefined scenario
        Given I ignore what I want to ignore
        Then this should not complain or break with an ignored error
