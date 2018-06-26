@feature-tag
Feature: Create failed feature

    @scenario-tag
    Scenario: Open website
        Given I open "http://webdriver.io/"
        Then the title would say "WebdriverIO"
