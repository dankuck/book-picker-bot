const fs = require('fs');
const nine_str = fs.readFileSync('./logs/9.json');
const nine = JSON.parse(nine_str);
const collect = require('collect.js');

const amazonConvertResponse = require('./amazon-convert-response');

nine.searches.forEach(({results}, i) => console.log(i, amazonConvertResponse(results)));

