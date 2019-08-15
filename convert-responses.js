
require('dotenv').config();

const filename = process.argv[2] || (() => {throw new Error('No filename provided')})();

const collect = require('collect.js');
const fs = require('fs');
const convertResponse = require('./amazon/convert-response.js');

const searches = JSON.parse(fs.readFileSync(filename));

const converted = searches
    .map(({word, results}) => convertResponse(results, word));

console.log(JSON.stringify(converted));
