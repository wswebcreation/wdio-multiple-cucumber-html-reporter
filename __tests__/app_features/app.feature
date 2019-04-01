@feature-tag
Feature: Open the WDIO app

    Scenario: Open website
        Given I open the app
        Then the home screen is shown
