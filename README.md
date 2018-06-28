# wdio-multiple-cucumber-html-reporter
A WebdriverIO plugin. Reporter that creates beautiful Cucumber HTML reports (https://github.com/wswebcreation/multiple-cucumber-html-reporter)

## TODO:
### high priority
Needs to be in the first beta
- [x] Add `Before`-step to the json, see the remarks about the Before steps
- [x] Add `After`-step to the json, see the remarks about the After steps
- [x] Add browser data to the report, first start with the default capabilities
- [x] Add screenshots to the report
- [x] Add multiple screenshots to the report in 1 step
- [x] Test in multiple browsers in parallel
- [ ] Check / add `Passed` status
- [ ] Check / add `Failed` status
- [ ] Check / add `Pending` status
- [ ] Check / add `Ambiguous` status
- [ ] Check / add `Skipped` status
- [ ] Check / add `undefined` status
- [ ] Test on Windows
- [ ] Test on Android
- [ ] Test on iOS
- [ ] Look at [CucumberJS feature](https://github.com/cucumber/cucumber-js/tree/master/features)-files to see what I've missed 

### low priority
Needs to be in, but are not mandatory
- [ ] Add `Hooks` to the json
- [ ] Add attachments to the report, see [attachments](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/attachments.md)


### research
- [ ] I know determine the platformName a little bit hacky, need to make this better
- [ ] Find out where the keywords are, there is no `Given, When, Then` comming back from webdriver.io 
- [ ] Add data tables to the report, see [data tables](https://github.com/cucumber/cucumber-js/blob/master/features/data_tables.feature) => **CURRENTLY NOT SUPPORTED BY WDIO-CUCUMBER-FRAMEWORK, NEED TO INVESTIGATE THIS**


## Some remarks
### Before hooks
Investigate how this works in Allure
#### Pass
Not logged in wdio-cucumberjs-framework => not in this module

#### Failed
Automatically logged by my implementation, not all data is logged like screenshots and so on

#### Pending
Pending state will result in the following:
- Beforehook will not get the status, there is only a start, not a pass/failed/pending
- All Scenario steps will get status pending
Meaning I can't log this

### After hooks
Investigate how this works in Allure
#### Pass
Not logged in wdio-cucumberjs-framework => not in this module
#### Failed
Automatically logged by my implementation, not all data is logged like screenshots and so on

#### Pending
Status pending of the After hook has no effect on the status of the report / wdio-cucumber-framework will not report this status
