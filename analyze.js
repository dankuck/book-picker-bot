
require('dotenv').config();

const filename = process.argv[2] || (() => {throw new Error('No filename provided')})();

const collect = require('collect.js');
const fs = require('fs');
const structure = collect(JSON.parse(fs.readFileSync(filename)));
const analyzeStructure = require('./analysis/structure-analyzer');

console.log(JSON.stringify(analyzeStructure(structure)));
