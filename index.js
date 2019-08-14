
require('dotenv').config();

const count = process.argv[2] || 1;

const fs = require('fs');
const collect = require('collect.js');
const amazon = require('./amazon/amazon');
const randomWord = require('./words/random-word');
const convertResponse = require('./amazon/convert-response');

const range = count => [...new Array(parseInt(count))];

const calls = range(count)
    .map(() => {
        const word = randomWord();
        return amazon.search(word)
            .then(results => convertResponse(results, word))
            .catch(err => console.error(err), []);
    });

Promise.all(calls)
    .then(
        (searches) => {
            console.log(JSON.stringify(searches));
        },
        console.error
    );
