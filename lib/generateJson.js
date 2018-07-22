import { ensureDirSync, outputJsonSync } from 'fs-extra';
import { resolve } from 'path';

/**
 * Generate the JSON file with all the Cucumber data in it
 *
 * @param {string}  folder the location where the JSON file needs to be saved
 * @param {object}  data the JSON data
 */
export function generateJson(folder, data) {
    const jsonFolder = resolve(process.cwd(), folder);
    ensureDirSync(jsonFolder);
    const jsonFile = resolve(jsonFolder, `s${(new Date).getTime()}.json`);
    const json = [];

    Object.entries(data).forEach(([key, val]) => {
        Object.entries(val._elements).forEach(([key1, val1]) => {
            val.elements.push(val1);
        });
        // Delete temporary data
        delete val._elements;
        delete val._screenshots;
        json.push(val)
    });

    outputJsonSync(jsonFile, json)
}

