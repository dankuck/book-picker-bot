
require('dotenv').config();

const filename = process.argv[2] || (() => {throw new Error('No filename provided')})();

const collect = require('collect.js');
const fs = require('fs');
const ItemSelector = require('./item-selector/item-selector.js');
const ItemTagger = require('./item-selector/item-tagger.js');
const {rules, reject} = require('./rules.js');

const selector = new ItemSelector(rules);
const tagger = new ItemTagger(rules);

const pool = collect(JSON.parse(fs.readFileSync(filename)))
    .reject(reject)
    .all();

const selected = tagger.tag(
    selector.select(pool)
);

console.log(JSON.stringify(selected));
