
require('dotenv').config();

const count = process.argv[2] || 1;

const collect = require('collect.js');
const amazon = require('./amazon/amazon');
const randomWord = require('./words/random-word');

const range = count => [...new Array(parseInt(count))];

const calls = range(count)
    .map(() => {
        const word = randomWord();
        return amazon.search(word)
            .then(
                (results) => {
                    return {word, results};
                },
                (error) => {
                    console.error({word, error});
                    return {word, error};
                }
            )
    });

Promise.all(calls)
    .then(
        (searches) => {
            console.log(JSON.stringify(searches));
        },
        console.error
    );
