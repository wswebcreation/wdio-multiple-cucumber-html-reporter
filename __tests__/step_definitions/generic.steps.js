import {After, Given, Status, Then} from 'cucumber';

Given(/I open "(.*)"/, url => {
   browser.url(url);
});

Then(/the title would say "(.*)"/, title => {
   expect(browser.getTitle()).to.equal(title);
});


After((scenarioResult)=>{
    if (scenarioResult.status === Status.FAILED) {
        var name = 'ERROR-chrome-' + Date.now();
        browser.saveScreenshot('./errorShots/' + name + '.png')
    }
});
