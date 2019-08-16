
require('dotenv').config();

const count = process.argv[2] || 1;
const filename = process.argv[3] || null;

const fs = require('fs');
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
                    if (error.message === 'Request failed with status code 503') {
                        console.error('Throttling detected. Exiting.');
                        process.exit();
                    }
                    return {word, error};
                }
            )
    });

if (filename) {
    const allSearches = [];
    const addSearch = search => {
        allSearches.push(search);
        fs.writeFileSync(filename, JSON.stringify(allSearches));
    };
    calls.forEach(call => call.then(addSearch))
} else {
    Promise.all(calls)
        .then(
            (searches) => {
                console.log(JSON.stringify(searches));
            },
            console.error
        );
}
