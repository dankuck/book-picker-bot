
require('dotenv').config();

const filename = process.argv[2] || (() => {throw new Error('No filename provided')})();

const collect = require('collect.js');
const fs = require('fs');
const convertResponse = require('./amazon/convert-response.js');

const searches = JSON.parse(fs.readFileSync(filename));

const errors = [];

const converted = searches
    .map(({word, results}) => {
        try {
            return convertResponse(results, word)
        } catch (e) {
            errors.push(e.message);
            return [];
        }
    });

console.log(JSON.stringify(converted));

if (errors.length > 0) {
    collect(errors)
        .groupBy(msg => msg)
        .each((msgs, msg) => console.error(`${msgs.count()} errors of: ${msg}`));
}
