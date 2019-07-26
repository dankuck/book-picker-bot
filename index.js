const count = process.argv[2] || 1;

const fs = require('fs');
const collect = require('collect.js');
const libraryOfCongress = require('./library-of-congress');

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
            const first = results[0];
            if (!first) {
                console.log(word, 'no results');
            } else {
                const {title, subject, description, other_title, image_url, dates} = first;
                console.log(word, results.length, Object.keys(first), {title, subject, description, other_title, image_url, dates});
            }
        })
        .catch(console.error);
}
