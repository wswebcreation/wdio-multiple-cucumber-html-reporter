@feature-tag
Feature: Create passed feature

    @scenario-tag
    Scenario: Open website
        Given I open "http://webdriver.io/"
        Then the title would say "WebdriverIO - WebDriver bindings for Node.js"

    @scenario-tag
    Scenario: Open other website
        Given I open "https://developer.mozilla.org/nl/"
        Then the title would say "MDN-webdocumenten"
