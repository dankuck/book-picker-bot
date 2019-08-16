
require('dotenv').config();

const filename = process.argv[2] || (() => {throw new Error('No filename provided')})();

const fs = require('fs');
const structure = JSON.parse(fs.readFileSync(filename));
const analyzeStructure = require('./analysis/structure-analyzer');

console.log(JSON.stringify(analyzeStructure(structure)));
