const fs = require('fs');
const nine_str = fs.readFileSync(__dirname + '/../logs/9.json');
const nine = JSON.parse(nine_str);
const collect = require('collect.js');

const amazonConvertResponse = require('../amazon/convert-response');

const amazonItems = collect(nine.searches)
    .flatMap(({results, word}, i) => {
        try {
            return amazonConvertResponse(results, word);
        } catch (e) {
            console.log('Error: ' + e);
            return [];
        }
    })
    .all();

console.log(amazonItems.length);

console.log('fields', Object.keys(amazonItems[0]));

for (let field in amazonItems[0]) {
    console.log(`without ${field}`, collect(amazonItems).filter(item => !item[field]).all().length);
}

for (let field in amazonItems[0]) {
    const examples = collect(amazonItems).map(item => item[field]).unique();
    console.log(`examples of ${field}`, examples.take(15).all(), `${examples.count()} total`);
}

const paired = collect(amazonItems)
    .reject(item => {
        return /calendar/i.test(item.format)
            || /map/i.test(item.format)
            || !item.offer_counts
            || (item.offer_counts.used + item.offer_counts.collectible + item.offer_counts.refurbished) < 8
            || !item.published_at
            || !item.languages.includes('English')
            || !item.image
    })
    .all();

console.log('paired down', paired.length);

for (let field in paired[0]) {
    console.log(`without ${field}`, collect(paired).filter(item => !item[field]).all().length);
}

for (let field in paired[0]) {
    const examples = collect(paired).map(item => item[field]).unique();
    console.log(`examples of ${field}`, examples.take(15).all(), `${examples.count()} total`);
}

const oneFromEach = collect(paired)
    .groupBy('search')
    .map(items => {
        return collect(items).random(Math.floor(Math.random() * 5)).all();
    })
    .flatten(1);

console.log(oneFromEach.count(), oneFromEach.map(item => item.title + ' (' + item.search + ')'));
