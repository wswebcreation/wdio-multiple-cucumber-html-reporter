import Cucumber, { defineSupportCode } from 'cucumber';
import { ensureDirSync, writeJsonSync } from 'fs-extra';
import { join } from 'path';

const jsonFormatter = new Cucumber.JsonFormatter();
const projectRoot = process.cwd();

/**
 * This hook is needed to generate a json-file for the reporting
 */
defineSupportCode(({ registerListener }) => {
    registerListener(jsonFormatter);

    return generateAndSaveJsonFile();

    /**
     * Generate and save the report json files
     */
    function generateAndSaveJsonFile() {
        jsonFormatter.log = (report) => {
            adjustAndSaveJsonFile(browser.desiredCapabilities, report);
        };
    }

    /**
     * Adjust and save the json files
     */
    function adjustAndSaveJsonFile(capabilities, report) {
        const jsonReport = JSON.parse(report);
        if (jsonReport.length > 0) {
            const featureName = jsonReport[0].name.replace(/\s+/g, '_').replace(/\W/g, '').toLowerCase() || 'noName';
            const snapshotPath = join(projectRoot, '.dist/json-output');
            const filePath = join(snapshotPath, `${featureName}.${capabilities.browserName}.${(new Date).getTime()}.json`); // eslint-disable-line
            jsonReport[0].metadata = {
                browser: {
                    name: capabilities.browserName,
                    version: '60'
                },
                device: 'local development machine',
                platform: {
                    name: capabilities.platformName,
                    version: capabilities.platformVersion,
                },
            };

            ensureDirSync(snapshotPath);

            writeJsonSync(filePath, jsonReport, { spaces: 2 });
        }
    }
});
