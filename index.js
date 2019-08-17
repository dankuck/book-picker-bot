
require('dotenv').config();

const count = process.argv[2] || 1;
const outputFilename = process.argv[3] || null;

const fs = require('fs');
const collect = require('collect.js');
const amazon = require('./amazon/amazon');
const randomWord = require('./words/random-word');
const convertResponse = require('./amazon/convert-response');
const ItemSelector = require('./item-selector/item-selector.js');
const {rules, reject} = require('./rules.js');

const selector = new ItemSelector(rules);

const range = count => [...new Array(parseInt(count))];

const setupWriteToFile = function (filename, calls) {

    let items = [];

    const addViaRewrite = (newItems) => {
        items = items.concat(newItems);
        const selected = selector.select(items);
        fs.writeFileSync(outputFilename, JSON.stringify(selected));
    };

    calls.forEach(call => call.then(addViaRewrite, console.error));
};

const setupWriteToConsole = function (calls) {

    let continuouslyWroteFirstItem = false;
    let selected = [];


    const startContinuousWrite = () => {
        console.log("[");
    };

    const writeContinuously = (newItems) => {
        // select more items starting with what we already selected
        const newSelected = selector.select(newItems, Infinity, selected);
        // only write out the new items, since the old ones were already written
        newSelected
            .slice(selected.length)
            .forEach(item => {
                if (continuouslyWroteFirstItem) {
                    console.log(",");
                } else {
                    continuouslyWroteFirstItem = true;
                }
                console.log(JSON.stringify(item));
            });
        // remember the new selections
        selected = newSelected;
    };

    const finishContinuousWrite = () => {
        console.log("]");
    };

    startContinuousWrite();
    const addAll = calls.map(call => call.then(writeContinuously));
    Promise.all(addAll)
        .then(finishContinuousWrite);
};

const calls = range(count)
    .map(() => {
        const word = randomWord();
        return amazon.search(word)
            .then(results => convertResponse(results, word))
            .then(items => collect(items).reject(reject).all())
            .catch(err => { console.error(err); return [] });
    });

if (outputFilename) {
    setupWriteToFile(outputFilename, calls);
} else {
    setupWriteToConsole(calls);
}
