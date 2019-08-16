
require('dotenv').config();

const fs = require('fs');
const collect = require('collect.js');
const convertResponse = require('./amazon/convert-response.js');

const filenames = process.argv.slice(2);
if (filenames.length === 0) {
    throw new Error('No filename provided');
}

const errors = [];

const result = filenames
    .map(filename => JSON.parse(fs.readFileSync(filename)))
    .map(({word, results}) => {
        try {
            return convertResponse(results, word)
        } catch (e) {
            errors.push(e.message);
            return [];
        }
    })
    .reduce((acc, array) => acc.concat(array), []);

console.log(JSON.stringify(result));

if (errors.length > 0) {
    collect(errors)
        .groupBy(msg => msg)
        .each((msgs, msg) => console.error(`${msgs.count()} errors of: ${msg}`));
}
