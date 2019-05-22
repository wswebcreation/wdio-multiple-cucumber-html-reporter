import events from 'events';
import process from 'process';
import { removeSync } from 'fs-extra';
import { generateJson } from './generateJson';
import { generate } from 'multiple-cucumber-html-reporter';

const FEATURE = 'Feature';
const SCENARIO = 'Scenario';
const NOT_KNOWN = 'not known';
const AFTER = 'After';
const BEFORE = 'Before';
const TEXT_PLAIN = 'text/plain';

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
        // this.baseReporter = baseReporter;
        this.instanceData = {};
        this.results = {};
        this.scenarioName = null;

        // this.on('hook:start', ::this.hookStart);
        // this.on('hook:end', ::this.hookEnd);

        this.on('start', ::this.onStart);

        // Test framework events
        this.on('suite:start', ::this.suiteStart);
        // this.on('suite:end', ::this.suiteEnd);
        this.on('test:start', ::this.testStart);
        this.on('test:pass', ::this.testPass);
        this.on('test:fail', ::this.testFail);
        this.on('test:pending', ::this.testPending);

        // Runner events (webdriver)
        // this.on('start', ::this.start);
        // this.on('runner:command', ::this.runnerCommand);
        this.on('runner:result', ::this.runnerResult);
        this.on('end', ::this.onEnd);

        // Multiple Cucumber HTML events
        this.on('mchr:attachment', ::this.mchrAttachment)
    }

    onStart() {
        if (this.options.removeFolders) {
            removeSync(this.options.jsonFolder);
            removeSync(this.options.reportFolder)
        }
    }

    // hookStart(payload) {}
    // hookEnd(payload) {}

    suiteStart(suite) {
        const cid = suite.cid;
        if (!this.results[ cid ]) {
            this.results[ cid ] = this.getFeatureDataObject(suite);
        }
        this.scenarioName = suite.title;
    }

    // suiteEnd(suite) {}

    testStart(test) {
        if (!this.results[ test.cid ]._elements[ test.parent ]) {
            this.results[ test.cid ]._elements[ test.parent ] = this.getScenarioDataObject(test);
        }
    }

    testPass(test) {
        this.results[ test.cid ]._elements[ test.parent ].steps.push(this.getStepDataObject(test, 'passed'));
    }

    testFail(test) {
        this.results[ test.cid ]._elements[ test.parent ].steps.push(this.getStepDataObject(test, 'failed'));
    }

    testPending(test) {
        this.results[ test.cid ]._elements[ test.parent ].steps.push(this.getStepDataObject(test, 'pending'));
    }

    /**
     * Runner
     */
    // runnerCommand(command) {}

    runnerResult(result) {
        // Save browserdata so it can be used later
        const cid = result.cid;
        if (!this.instanceData[ cid ]) {
            this.instanceData[ cid ] = this.determineMetadata(result);
        }
    }

    onEnd(payload) {
        const jsonFolder = this.options.jsonFolder;

        // Generate the jsons
        generateJson(jsonFolder, this.results);

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
            durationInMS: this.options.durationInMS || false,
            openReportInBrowser: this.options.openReportInBrowser || false,
            ...(this.options.overrideStyle ? { overrideStyle: this.options.overrideStyle } : {}),
            ...(this.options.pageFooter ? { pageFooter: this.options.pageFooter } : {}),
            ...(this.options.pageTitle ? { pageTitle: this.options.pageTitle } : {}),
            ...(this.options.reportName ? { reportName: this.options.reportName } : {}),
            saveCollectedJSON: this.options.saveCollectedJSON || false,
        });
    }

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
     *      _attachment: Array
     *  }
     * }
     */
    getFeatureDataObject(featureData) {
        return {
            keyword: FEATURE,
            description: this.escapeHTML(featureData.description),
            line: parseInt(featureData.uid.substring(featureData.title.length, featureData.uid.length)),
            name: this.escapeHTML(featureData.title),
            tags: featureData.tags,
            uri: featureData.specs[ 0 ],
            _elements: {},  // Temporary. All data will be copied to the `elements` when done
            elements: [],
            id: featureData.title.replace(/ /g, '-').toLowerCase(),
            _attachment: [], // Temporary, attachments will be added here and removed per step...
            ...this.instanceData[ featureData.cid ],
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
    getScenarioDataObject(scenarioData) {
        return {
            keyword: SCENARIO,
            description: this.escapeHTML(scenarioData.description),
            line: parseInt(scenarioData.parent.substring(this.scenarioName.length, scenarioData.parent.length)),
            name: this.escapeHTML(this.scenarioName),
            tags: scenarioData.tags,
            id: `${ this.results[ scenarioData.cid ].id };${ this.scenarioName.replace(/ /g, '-').toLowerCase() }`,
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
    getStepDataObject(stepData, status) {
        const stepResult = {
                arguments: stepData.argument || [],
                // keyword: ' ',
                keyword: stepData.keyword || ' ',
                name: this.escapeHTML(stepData.title),
                result: {
                    status: status,
                    duration: (stepData.duration * 1000000),
                    ...this.addFailedMessage(stepData, status)
                },
                line: parseInt(stepData.uid.substring(stepData.title.length, stepData.uid.length)),
                // Add the screenshot embeddings if there are screenshots
                ...this.defineEmbeddings(stepData.cid),
                match: {
                    location: 'can not be determined with webdriver.io'
                }
            }
        ;

        return stepResult;
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
    defineEmbeddings(cid) {
        const embeddings = this.results[ cid ]._attachment.length > 0
            ? { embeddings: [ ...this.results[ cid ]._attachment ] }
            : {};

        // Empty the attachments because there is no data anymore, step has finished
        this.results[ cid ]._attachment = [];

        return embeddings;
    }

    /**
     * Add a failed message
     *
     * @param {object}  testObject
     * @param {string}  status
     *
     * @return {object}
     */
    addFailedMessage(testObject, status) {
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
     *          app: {
     *              name: string,
     *              version: string
     *          },
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
    determineMetadata(data) {
        let app, browser;
        const desiredCapabilities = data.requestData.desiredCapabilities;
        const metadata = desiredCapabilities.metadata || {};
        const bodyValue = data.body.value || {};

        // When an app is used to test
        if (bodyValue.app || bodyValue.testobject_app_id || metadata.app) {
            const metaAppName = (metadata.app && metadata.app.name) ? metadata.app.name : 'No metadata.app.name available';
            const metaAppVersion = (metadata.app && metadata.app.version) ? metadata.app.version : 'No metadata.app.version available';
            const appPath = (bodyValue.app || bodyValue.testobject_app_id || metaAppName);
            const appName = appPath.substring(appPath.replace('\\', '/').lastIndexOf('/')).replace('/', '');

            // Provide the app name and version
            app = {
                app: {
                    name: appName,
                    version: metaAppVersion
                }
            };
            // Provide the devicename if there
            metadata.device = desiredCapabilities.deviceName
                || bodyValue.deviceName
                || metadata.device
                || null;
            metadata.platform = {
                name: desiredCapabilities.platformName
                    || bodyValue.platformName
                    || (metadata.platform && metadata.platform.name)
                    || 'No metadata.platform.name available',
                version: desiredCapabilities.platformVersion
                    || bodyValue.platformVersion
                    || (metadata.platform && metadata.platform.version)
                    || 'No metadata.platform.version available',
            }
        } else {
            const browserName = bodyValue.browserName
                || ((metadata && metadata.browser && metadata.browser.name) ? metadata.browser.name : 'No metadata.browser.name available')
            const browserVersion = bodyValue.version
                || bodyValue.browserVersion
                || ((metadata && metadata.browser && metadata.browser.version) ? metadata.browser.version : 'No metadata.browser.version available')

            browser = {
                browser: {
                    name: browserName,
                    version: browserVersion,
                }
            };
        }

        const device = (metadata && metadata.device) ? metadata.device : NOT_KNOWN;
        const platform = {
            name: (metadata && metadata.platform && metadata.platform.name) ? metadata.platform.name : NOT_KNOWN,
            version: (metadata && metadata.platform && metadata.platform.version) ? metadata.platform.version : NOT_KNOWN
        };

        return {
            metadata: {
                ...(app || browser),
                device,
                platform,
            }
        }
    }

    /**
     * Escape html in strings
     *
     * @param   {string}  string
     * @return  {string}
     */
    escapeHTML(string) {
        return !string ? string : string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/\'/g, '&#39;');
    }

    /**
     * Attach data to the report
     *
     * @param {string|object} data
     * @param {string} type Default is `text/plain`, otherwise what people deliver as a MIME type, like `application/json`, `image/png`
     * @param {string|undefined} hookType This will tell if the attach needs to take place for a before or after hook
     */
    static attach(data, type = TEXT_PLAIN, hookType = undefined) {
        process.send({ event: 'mchr:attachment', ...{ data, type, hookType } })
    }

    /**
     * Add the attachment to the result
     *
     * @param {string} cid
     * @param {string|object} data
     * @param {string} type
     * @param {string|undefined} hookType This will tell if the attach needs to take place for a before or after hook
     */
    mchrAttachment({ cid, data, type, hookType }) {
        let hook;
        // It could be that people don't provide the type, but just the hookType, so check that here
        type = this.validateHookType(type);
        if (type === BEFORE || type === AFTER) {
            hook = type;
            // Set the type to the default if the type has been used to set the hookType
            type = TEXT_PLAIN;
        }

        if (hookType) {
            hook = this.validateHookType(hookType);
        }

        if (data.value) {
            data = data.value;
        } else if (data.data) {
            data = Buffer.from(data.data).toString('base64');
        }

        // This will push all data that has been attached to the global, this will be parsed and cleaned for
        // each executed step (test) in the `passed||failed||pending`-state
        this.results[ cid ]._attachment.push({
            data: data,
            mime_type: type,
        });

        // If a hook  is used, add the hook data
        if (hook) {
            this.addHookData(cid, hook);
        }
    }

    /**
     * Validate if the hook type that is used is a valid hook or not
     *
     * @param {string} string
     *
     * @return {string}
     */
    validateHookType(string) {
        if (string && (this.capitalizeFirstLetter(string) === AFTER || this.capitalizeFirstLetter(string) === BEFORE)) {
            return this.capitalizeFirstLetter(string) === AFTER ? 'After' : 'Before';
        }

        return string;
    }

    /**
     * Capitalize the first letter of the string
     *
     * @param {string} string
     *
     * @return {string}
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
    }

    /**
     * Determine the hook data and determine if a before or after hook step needs to be made
     *
     * @param {number} cid
     * @param {string} hookType
     */
    addHookData(cid, hookType) {
        const scenarios = this.results[ cid ]._elements;
        const currentScenario = Object.keys(scenarios)[ Object.keys(scenarios).length - 1 ];
        const hookStepData = {
            keyword: hookType,
            title: '',
            uid: '',
            duration: 0,
            cid: cid,
        }
        const stepsArray = scenarios[ currentScenario ].steps;

        if (hookType === AFTER) {
            this.addAfterHookData(cid, currentScenario, hookStepData, stepsArray)
        } else {
            this.addBeforeHookData(cid, currentScenario, hookStepData, stepsArray)
        }
    }

    /**
     * Add after hook data, also determine if there is already an after hook, if so, add it to the current one
     *
     * @param {number} cid
     * @param {string} currentScenario
     * @param {string} hookStepData
     * @param {object} stepsArray
     */
    addAfterHookData(cid, currentScenario, hookStepData, stepsArray) {
        if (stepsArray[ stepsArray.length - 1 ].keyword === AFTER) {
            stepsArray[ stepsArray.length - 1 ].embeddings.push(this.results[ cid ]._attachment[ 0 ])
            this.results[ cid ]._attachment = [];
        } else {
            const hookData = this.getStepDataObject(hookStepData, 'passed');
            this.results[ cid ]._elements[ currentScenario ].steps.push(hookData);
        }
    }

    /**
     * Add before hook data, also determine if there is already a before hook, if so, add it to the current one
     *
     * @param {number} cid
     * @param {string} currentScenario
     * @param {string} hookStepData
     * @param {object} stepsArray
     */
    addBeforeHookData(cid, currentScenario, hookStepData, stepsArray) {
        if (stepsArray[ 0 ] && stepsArray[ 0 ].keyword === BEFORE) {
            stepsArray[ stepsArray.length - 1 ].embeddings.push(this.results[ cid ]._attachment[ 0 ])
            this.results[ cid ]._attachment = [];
        } else {
            const hookData = this.getStepDataObject(hookStepData, 'passed');
            this.results[ cid ]._elements[ currentScenario ].steps.unshift(hookData);
        }
    }
}

MultipleCucumberHtmlReporter.reporterName = 'multiple-cucumber-html-reporter';
export default MultipleCucumberHtmlReporter;
