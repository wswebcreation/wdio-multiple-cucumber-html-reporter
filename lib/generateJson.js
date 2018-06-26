import { outputJsonSync } from 'fs-extra';
import { resolve } from 'path';

export function generateJson(data) {
    const jsonFile = resolve(process.cwd(), `.tmp/new/jsonfile.${(new Date).getTime()}.json`);
    const json = [];

    Object.entries(data).forEach(([key, val]) => {
        Object.entries(val._elements).forEach(([key1, val1]) => {
            val.elements.push(val1);
        });
        delete val._elements;
        json.push(val)
    });

    outputJsonSync(jsonFile, json)
}

