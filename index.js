
require('dotenv').config();

const count = process.argv[2] || 1;

const fs = require('fs');
const collect = require('collect.js');
const libraryOfCongress = require('./library-of-congress');
const amazon = require('./amazon');
const analyzeStructure = require('./structure-analyzer');

const words_json = fs.readFileSync('./words.json');
const words = collect(JSON.parse(words_json));

const calls = [];

for (let i = 0; i < count; i++) {
    const word = words.random();
    console.log(`Searching Amazon for ${word}`);
    calls.push(
        amazon.search(word)
            .then(
                (results) => {
                    return {word, results};
                },
                (error) => {
                    console.error({word, error});
                    return {word, error};
                }
            )
    );
}

Promise.all(calls)
    .then(
        (responses) => {
            console.log(JSON.stringify(analyzeStructure(responses)));
        },
        console.error
    );
