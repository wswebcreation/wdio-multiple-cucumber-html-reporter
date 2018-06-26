const fs = require('fs-extra'); // eslint-disable-line
const argv = require('yargs').argv; // eslint-disable-line
const chai = require('chai'); // eslint-disable-line
const multipleCucumberHtmlReporter = require('../../build/reporter');
multipleCucumberHtmlReporter.reporterName = 'multiple-cucumber-html-reporter';

exports.config = {
    // ==================
    // Test Configuration
    // ==================
    sync: true,
    logLevel: argv.logLevel || 'silent',
    coloredLogs: true,
    bail: 0,
    baseUrl: 'http://webdriver.io',
    waitforTimeout: 20000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    capabilities: [
        {
            maxInstances: 1,
            browserName: 'chrome',
            chromeOptions: {
                args: ['--headless', 'disable-infobars'],
                prefs: {
                    download: {
                        prompt_for_download: false,
                        directory_upgrade: true,
                        default_directory: './tmp',
                    },
                },
            },
        },
    ],

    // ======================
    // Cucumber configuration
    // ======================
    framework: 'cucumber',
    specs: getFeatureFiles(),
    cucumberOpts: {
        require: [
            '__tests__/config/helpers/*.js',
            '__tests__/**/*.steps.js',
        ],
        backtrace: false,
        compiler: ['js:babel-register'],
        colors: true,
        snippets: true,
        source: true,
        tagExpression: '',
        timeout: 60000,
        ignoreUndefinedDefinitions: false,
        format: 'json:.tmp/results.json',
    },

    // ====================
    // Reporter
    // ====================
    reporters: ['spec', multipleCucumberHtmlReporter],
    reporterOptions: {
        outputDir: './.tmp'
    },
    // reporters: ['allure'],
    // reporterOptions: {
    //     allure: {
    //         outputDir: 'allure-results',
    //         disableWebdriverStepsReporting: true,
    //         useCucumberStepReporter: false
    //     }
    // },

    /**
     * Gets executed once before all workers get launched.
     */
    onPrepare: () => {
        console.log(`
=================================================================================
    The '.tmp'-folder is being removed. This is the folder that holds all the 
    reports and failure screenshots.
=================================================================================\n`);
        fs.emptyDirSync('.tmp/');
    },

    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`.
     */
    before: () => {
        /**
         * Setup the Chai assertion framework
         */
        global.expect = chai.expect;
        global.assert = chai.assert;
        global.should = chai.should();
    },
};

/**
 * Get the featurefiles that need to be run based on an command line flag that is passed,
 * if nothing is passed all the featurefiles are run
 *
 * @example:
 *
 * <pre>
 *     // For 1 feature
 *     npm run e2e.io -- --feature=playground
 *
 *     // For multiple features
 *     npm run e2e.io -- --feature=playground,login,...
 *
 *     // Else
 *     npm run e2e.ios
 * </pre>
 */
function getFeatureFiles() {
    if (argv.feature) {
        return argv.feature.split(',')
            .map(feature => `${process.cwd()}/__tests__/**/${feature}.feature`);
    }

    return [`${process.cwd()}/__tests__/**/*.feature`];
}
