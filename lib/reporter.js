import events from 'events'
import { generateJson } from './generateJson';
import { generate } from 'multiple-cucumber-html-reporter';

const suites = {};
const FEATURE = 'Feature';
const SCENARIO = 'Scenario';
const NOT_KNOWN = 'not known';
let instanceData = {};

class MultipleCucumberHtmlReporter extends events.EventEmitter {
    constructor(baseReporter, config, options = {}) {
        super();

        if (!options.htmlReporter) {
            throw new Error('Options need to be provided.');
        }

        if (!options.htmlReporter.jsonFolder) {
            throw new Error('A path which holds the JSON files should be provided.');
        }

        if (!options.htmlReporter.reportFolder) {
            throw new Error('An output path for the reports should be defined, no path was provided.');
        }

        this.options = options.htmlReporter;


        this.on('hook:start', ::this.hookStart);
        this.on('hook:end', ::this.hookEnd);
        // Test framework events
        this.on('suite:start', ::this.suiteStart);
        this.on('suite:end', ::this.suiteEnd);
        this.on('test:start', ::this.testStart);
        this.on('test:pass', ::this.testPass);
        this.on('test:fail', ::this.testFail);
        this.on('test:pending', ::this.testPending);

        // Runner events (webdriver)
        // this.on('start', ::this.start);
        this.on('runner:command', ::this.runnerCommand);
        this.on('runner:result', ::this.runnerResult);
        this.on('end', ::this.onEnd);
    }

    hookStart(payload) {}

    hookEnd(payload) {}

    suiteStart(suite) {
        const cid = suite.cid;
        if (!suites[cid]) {
            suites[cid] = getFeatureDataObject(suite);
        }
    }

    suiteEnd(suite) {
        // Attach an Afterhook if there are embeddings
        addAfterStep(suite);
    }

    testStart(test) {
        if (!suites[test.cid]._elements[test.parent]) {
            suites[test.cid]._elements[test.parent] = getScenarioDataObject(test);
        }
    }

    testPass(test) {
        suites[test.cid]._elements[test.parent].steps.push(getStepDataObject(test, 'passed'));
    }

    testFail(test) {
        suites[test.cid]._elements[test.parent].steps.push(getStepDataObject(test, 'failed'));
    }

    testPending(test) {
        suites[test.cid]._elements[test.parent].steps.push(getStepDataObject(test, 'pending'));
    }

    // Runner
    runnerCommand(command) {}

    runnerResult(result) {
        // Save browserdata so it can be used later
        const cid = result.cid;
        if (!instanceData[cid]) {
            instanceData[cid] = determineMetadata(result);
        }

        // attach the screenshot to the report
        attachScreenshot(result);
    }

    onEnd(payload) {
        if (debug) {
            console.log('end');
            console.log('payload = ', payload);
            console.log('\n');
        }

        const jsonFolder = this.options.jsonFolder;

        // Generate the jsons
        generateJson(jsonFolder, suites);

        // generate the report
        generate({
            // Required
            jsonDir: jsonFolder,
            reportPath: this.options.reportFolder,
            // Optional
            ...(this.options.customData ? { customData: this.options.customData } : {}),
            ...(this.options.customStyle ? { customStyle: this.options.customStyle } : {}),
            disableLog: this.options.disableLog || false,
            displayDuration: this.options.displayDuration || false,
            durationInMS: true,
            ...(this.options.metadata ? { metadata: this.options.metadata } : {}),
            openReportInBrowser: this.options.openReportInBrowser || false,
            ...(this.options.overrideStyle ? { overrideStyle: this.options.overrideStyle } : {}),
            ...(this.options.pageFooter ? { pageFooter: this.options.pageFooter } : {}),
            ...(this.options.pageTitle ? { pageTitle: this.options.pageTitle } : {}),
            ...(this.options.reportName ? { reportName: this.options.reportName } : {}),
            saveCollectedJSON: this.options.saveCollectedJSON || false,
        });
    }
}

MultipleCucumberHtmlReporter.reporterName = 'multiple-cucumber-html-reporter';
export default MultipleCucumberHtmlReporter;

/**
 * All functions
 */


/**
 * Get the feature data object
 *
 * @param {object} featureData
 *
 * @returns {
 *  {
 *      keyword: string,
 *      line: number,
 *      name: string,
 *      tags: string,
 *      uri: string,
 *      _elements: {object},
 *      elements: Array,
 *      id: string,
 *      _screenshots: Array
 *  }
 * }
 */
function getFeatureDataObject(featureData) {
    return {
        keyword: FEATURE,
        description: featureData.description,
        line: parseInt(featureData.uid.substring(featureData.title.length, featureData.uid.length)),
        name: featureData.title,
        tags: featureData.tags,
        uri: featureData.specs[0],
        _elements: {},  // Temporary. All data will be copied to the `elements` when done
        elements: [],
        id: featureData.title.replace(/ /g, '-').toLowerCase(),
        _screenshots: [], // Temporary, screenshots will be added here and removed per step...
        ...instanceData[featureData.cid],
    }
}

/**
 * Get the scenario data object
 *
 * @param {object} scenarioData This is the testdata of the current scenario
 *
 * @returns {
 *  {
 *      keyword: string,
 *      line: number,
 *      name: string,
 *      tags: string,
 *      id: string,
 *      steps: Array
 *  }
 * }
 */
function getScenarioDataObject(scenarioData) {
    return {
        keyword: SCENARIO,
        description: scenarioData.description,
        line: parseInt(scenarioData.parent.substring(scenarioData.scenarioName.length, scenarioData.parent.length)),
        name: scenarioData.scenarioName,
        tags: scenarioData.tags,
        id: `${suites[scenarioData.cid].id};${scenarioData.scenarioName.replace(/ /g, '-').toLowerCase()}`,
        steps: []
    }
}

/**
 * Get the step data object
 *
 * @param {object} stepData This is the testdata of the step
 * @param status
 * @returns {{arguments: Array, keyword: string, name: *, result: {status: *, duration: *}, line: number, match: {location: string}}}
 */
function getStepDataObject(stepData, status) {
    const stepResult = {
            arguments: stepData.argument || [],
            // keyword: ' ',
            keyword: stepData.keyword || ' ',
            name: stepData.title,
            result: {
                status: status,
                duration: stepData.duration,
                ...addFailedMessage(stepData, status)
            },
            line: parseInt(stepData.uid.substring(stepData.title.length, stepData.uid.length)),
            // Add the screenshot embeddings if there are screenshots
            ...defineEmbeddings(stepData.cid),
            match: {
                location: 'can not be determined with webdriver.io'
            }
        }
    ;

    // Empty the _screenshots because there is no data anymore, test has finished
    suites[stepData.cid]._screenshots = [];

    return stepResult;
}

/**
 * Add a failed message
 *
 * @param {object}  testObject
 * @param {string}  status
 *
 * @return {object}
 */
function addFailedMessage(testObject, status) {
    if (status === 'failed') {
        return {
            error_message: testObject.err.stack
        }
    }

    return {}
}

/**
 * Determine the metadata that needs to be added
 *
 * @TODO: Need to look at the implementation, is not that nice
 *
 * @param {object} data instance data
 *
 * @returns {
 *  {
 *      metadata: {
 *          browser: {
 *              name: string,
 *              version: string
 *          },
 *          device: string,
 *          platform: {
 *              name: string,
 *              version: string
 *          }
 *      }
 *  }
 * }
 */
function determineMetadata(data) {
    const metadata = data.requestData.desiredCapabilities.metadata;
    const currentBrowserName = data.body.value.browserName;
    const currentBrowserVersion = data.body.value.version || data.body.value.browserVersion;
    const browser = {
        name: metadata && metadata.browser && metadata.browser.name ? metadata.browser.name : currentBrowserName,
        version: metadata && metadata.browser && metadata.browser.version ? metadata.browser.version : currentBrowserVersion,
    };
    const device = metadata && metadata.device ? metadata.device : NOT_KNOWN;
    const platform = {
        name: metadata && metadata.platform && metadata.platform.name ? metadata.platform.name : NOT_KNOWN,
        version: metadata && metadata.platform && metadata.platform.version ? metadata.platform.version : NOT_KNOWN
    };

    return {
        metadata: {
            browser,
            device,
            platform,
        }
    }
}

/**
 * Attach a screenshot to the suites report object
 *
 * @param {object} data Instance data
 */
function attachScreenshot(data) {
    if (data.requestOptions.uri.path.match(/\/session\/[^/]*\/screenshot/) && data.body.value) {
        suites[data.cid]._screenshots.push({
            data: data.body.value,
            mime_type: 'image/png',
        });
    }
}

/**
 * Add the after step, if there is data, to the steps in the suites report
 *
 * @param {object} currentScenario the suite we are currently running
 */
function addAfterStep(currentScenario) {
    if (suites[currentScenario.cid]._screenshots.length > 0) {
        // Add an After step if there are screenshots. Defaulted most of the values because they are not available
        // in webdriverio
        suites[currentScenario.cid]._elements[currentScenario.uid].steps.push({
            arguments: [],
            keyword: 'After',
            result: {
                status: 'passed',
                duration: 0
            },
            hidden: true,
            // Add the screenshot embeddings if there are screenshots
            ...defineEmbeddings(currentScenario.cid),
            match: {
                location: 'can not be determined with webdriver.io'
            }
        });
    }

    // Empty the _screenshots because there is no data anymore, test has finished
    suites[currentScenario.cid]._screenshots = [];
}

/**
 * Define the embeddings
 *
 * @param {string} cid The current instance id
 *
 * @returns {{
 *      embeddings: *
 *  } || {}
 * }
 */
function defineEmbeddings(cid) {
    return {
        // Add the screenshot embeddings if there are screenshots
        ...(suites[cid]._screenshots.length > 0
                ? { embeddings: [...suites[cid]._screenshots] }
                : {}
        ),
    };
}
