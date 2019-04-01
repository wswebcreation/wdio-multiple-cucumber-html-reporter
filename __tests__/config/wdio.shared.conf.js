const { argv } = require('yargs');
const chai = require('chai');
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

    // ======================
    // Cucumber configuration
    // ======================
    framework: 'cucumber',
    specs: getFeatureFiles(),
    cucumberOpts: {
        require: [
            '__tests__/**/*.steps.js',
        ],
        backtrace: false,
        compiler: [ 'js:babel-register' ],
        colors: true,
        snippets: true,
        source: true,
        tagExpression: 'not @wip and not @ignore',
        timeout: 60000,
        failAmbiguousDefinitions: false,
        ignoreUndefinedDefinitions: false,
    },

    // ====================
    // Reporter
    // ====================
    reporters: [ 'spec', multipleCucumberHtmlReporter ],
    reporterOptions: {
        htmlReporter: {
            removeFolders: true,
            jsonFolder: '.tmp/new/',
            reportFolder: '.tmp/multiple-cucumber-html-reporter/',
            displayDuration: true,
            openReportInBrowser: true,
            saveCollectedJSON: true,
            disableLog: true,
            pageTitle: 'pageTitle',
            reportName: 'reportName',
            pageFooter: '<div><h1>Custom footer</h1></div>',
            customData: {
                title: 'Run info',
                data: [
                    { label: 'Project', value: 'Custom project' },
                    { label: 'Release', value: '1.2.3' },
                    { label: 'Cycle', value: 'B11221.34321' },
                    { label: 'Execution Start Time', value: 'Nov 19th 2017, 02:31 PM EST' },
                    { label: 'Execution End Time', value: 'Nov 19th 2017, 02:56 PM EST' }
                ]
            },
        }
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
 *     npm run test -- --feature=playground
 *
 *     // For multiple features
 *     npm run test -- --feature=playground,login,...
 *
 *     // Else
 *     npm run test
 * </pre>
 */
function getFeatureFiles() {
    if (argv.feature) {
        return argv.feature.split(',').map(feature => `${ process.cwd() }/__tests__/**/${ feature }.feature`);
    }

    return [ `${ process.cwd() }/__tests__/**/*.feature` ];
}
