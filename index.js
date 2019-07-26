const count = process.argv[2] || 1;

const fs = require('fs');
const collect = require('collect.js');
const libraryOfCongress = require('./library-of-congress');
const analyzeStructure = require('./structure-analyzer');

const words_json = fs.readFileSync('./words.json');
const words = collect(JSON.parse(words_json));

for (let i = 0; i < count; i++) {
    const word = words.random();
    Promise
        .all([
            word,
            libraryOfCongress.search(word),
        ])
        .then(([word, results]) => {
            if (!results.length) {
                console.log(word, 'no results');
            } else {
                console.log(JSON.stringify({
                    word,
                    count: results.length,
                    analysis: analyzeStructure(results),
                }));
            }
        })
        .catch(console.error);
}
