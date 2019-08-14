const collect = require('collect.js');
const fs = require('fs');
const words = collect(JSON.parse(fs.readFileSync(__dirname + '/words.json')));

module.exports = () => words.random();
