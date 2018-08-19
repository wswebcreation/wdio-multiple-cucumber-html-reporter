import {After, Before, Given, Status, Then, When} from 'cucumber';

Given(/I open "(.*)"/, function(url) {
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

Given(/a table step/, table =>{
    console.log('table = ', table);
});

Given(/a (skipped|pending) step/, stepType =>{
    return Promise.resolve(stepType);
});

Given(/an ambiguous step/, stepType =>{
    return Promise.resolve('ambiguous');
});

Given(/an ambiguous step/, stepType =>{
    return Promise.resolve('ambiguous');
});

Given(/an outline (.*) step/, outline =>{
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
After((scenarioResult)=>{
    if (scenarioResult.result.status === Status.FAILED) {
        browser.saveScreenshot()
    }
    return scenarioResult.status;
});

/**
 * Some extra's
 */

Given(/I'm a given background/,()=>{});
When(/I'm a when background/,()=>{});
When(/I'm a scenario when step/,()=>{});
Then(/I would be a when background/,()=>{});
Then(/I'm a scenario then step/,()=>{});
