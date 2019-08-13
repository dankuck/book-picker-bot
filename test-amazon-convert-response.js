const fs = require('fs');
const nine_str = fs.readFileSync('./logs/9.json');
const nine = JSON.parse(nine_str);
const collect = require('collect.js');

const amazonConvertResponse = require('./amazon-convert-response');

const amazonItems = collect(nine.searches)
    .flatMap(({results}, i) => {
        try {
            return amazonConvertResponse(results);
        } catch {
            return [];
        }
    })
    .all();

console.log(amazonItems.length);
