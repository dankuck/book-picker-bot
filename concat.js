
require('dotenv').config();

const filenames = process.argv.slice(2);
if (filenames.length === 0) {
    throw new Error('No filename provided');
}

const collect = require('collect.js');
const fs = require('fs');

const result = filenames
    .map(filename => JSON.parse(fs.readFileSync(filename)))
    .reduce((acc, array) => acc.concat(array), []);

console.log(JSON.stringify(result));
