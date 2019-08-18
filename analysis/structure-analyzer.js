/**
 |----------------------------
 | structure-analyizer.js
 |----------------------------
 | This is meant to give information about the structures found in an array.
 |
 */

const collect = require('collect.js');

function analyzeStructure(objects) {
    return analyze({}, objects);
}

function describeType(value) {
    if (value instanceof Array) {
        return 'Array[' + collect(value).map(element => describeType(element)).unique().join('|') + ']';
    }
    if (value === null) {
        return 'null';
    }
    if (typeof value === 'object') {
        return value.constructor.name;
    }
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }
    return typeof value;
}

function lengthOf(value) {
    return value && value.hasOwnProperty && value.hasOwnProperty('length') && value.length;
}

function getExample(value, skip_arrays = false) {
    if (value instanceof Array) {
        if (skip_arrays) {
            return null;
        } else {
            return getExample(collect(value).first(Boolean), true);
        }
    }
    if (value instanceof Object) {
        return null;
    }
    if (value) {
        return value;
    }
    return null;
}

function analyze(analysis, entry, path = '') {
    if (entry instanceof Array) {
        return entry.reduce(
            (analysis, entry) => analyze(analysis, entry, `${path}[]`),
            analysis
        );
    }
    if (typeof entry !== 'object' || entry === null) {
        return analysis;
    }
    for (let field in entry) {
        if (!analysis[field]) {
            analysis[field] = {
                path: `${path}.${field}`,
                types: {},
                max_length: null,
                example: null,
                has: {},
            };
        }
    }
    for (let field in analysis) {
        const type = describeType(entry[field]);
        if (!analysis[field].types[type]) {
            analysis[field].types[type] = 0;
        }
        analysis[field].types[type]++;
        const length = lengthOf(entry[field]);
        if (length > analysis[field].max_length) {
            analysis[field].max_length = length;
        }
        if (analysis[field].example === null) {
            const example = getExample(entry[field]);
            if (example) {
                analysis[field].example = example;
            }
        }
        analyze(analysis[field].has, entry[field], analysis[field].path);
    }
    return analysis;
};

module.exports = analyzeStructure;
