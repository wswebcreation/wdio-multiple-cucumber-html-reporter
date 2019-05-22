import { After, Before, Given, Status, Then, When } from 'cucumber';
import multipleCucumberHtmlReporter from '../../build/reporter';

Given(/I open "(.*)"/, function (url) {
    browser.url(url);
    /**
     * Enable below to test with double screenshots with the old way
     */
    // this.attach(browser.saveScreenshot(), 'image/png');
    // this.attach(browser.saveScreenshot(), 'image/png');
    /**
     * Enable below to test with double screenshots with the new way
     */
    // browser.saveScreenshot();
    // browser.saveScreenshot();
});

Given(/a table step/, table => {
    console.log('table = ', table);
});

Given(/a (skipped|pending) step/, stepType => {
    return Promise.resolve(stepType);
});

Given(/an ambiguous step/, stepType => {
    return Promise.resolve('ambiguous');
});

Given(/an ambiguous step/, stepType => {
    return Promise.resolve('ambiguous');
});

Given(/an outline (.*) step/, outline => {
    return Promise.resolve();
});

Then(/the title would say "(.*)"/, title => {
    expect(browser.getTitle()).to.equal(title);
});


Before((scenarioResult) => {
    // console.log('Before-hook');
    // console.log('beforeData = ', scenarioResult);
    // browser.pause(5000)
    // expect(true).to.equal(true);
    // return Promise.resolve('pending');

    multipleCucumberHtmlReporter.attach('Before string 1', 'before');
    multipleCucumberHtmlReporter.attach('Before string 2', 'text/plain', 'before');
});

/**
 * Hook for the old report hook
 */
// After(function (scenarioResult) {
//     console.log('After-hook');
//     if (scenarioResult.status === Status.FAILED) {
//         this.attach(browser.saveScreenshot(), 'image/png');
//     }
//
//     // console.log('after data = ', scenarioResult);
//     // return scenarioResult.status;
//     // expect(true).to.equal(true);
//     // return 'pending';
//
//     return scenarioResult.status;
// });

/**
 * Hook for the new
 */
// After(function (scenarioResult) {
//     if (scenarioResult.result.status === Status.FAILED) {
//         browser.saveScreenshot()
//     }
//
//     this.attach('{"name": "some JSON"}', 'application/json');
//     this.attach('Some text');
//
//     return scenarioResult.status;
// });

After(scenarioResult => {
    if (scenarioResult.result.status === Status.FAILED) {
        // It will add the screenshot to the JSON
        multipleCucumberHtmlReporter.attach('After string 1', 'after');
        multipleCucumberHtmlReporter.attach(browser.screenshot(), 'image/png', 'after');
        multipleCucumberHtmlReporter.attach('After string 2', 'text/plain', 'after');
    }
    return scenarioResult.status;
});

/**
 * Some extra's
 */
Given(/I'm a given background/, () => {});
When(/I'm a when background/, () => {});
When(/I'm a scenario when step/, () => {});
Then(/I would be a when background/, () => {});
Then(/I'm a scenario then step/, () => {});


/**
 * For the attach
 */
Given(/I open the url "(.*)"/, url => {
    browser.url(url)
    multipleCucumberHtmlReporter.attach('just a string');
    multipleCucumberHtmlReporter.attach({ 'json-string': true }, 'application/json');
    multipleCucumberHtmlReporter.attach(browser.saveScreenshot(), 'image/png');
    multipleCucumberHtmlReporter.attach(browser.screenshot(), 'image/png');
});

/**
 * For the app
 */
Given(/I open the app/, () => {});
Given(/the home screen is shown/, () => {
    expect($('~Home').waitForVisible(20000)).to.equal(true);
});
