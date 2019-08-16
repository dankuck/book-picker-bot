
require('dotenv').config();

const filename = process.argv[2] || (() => {throw new Error('No filename provided')})();

const collect = require('collect.js');
const fs = require('fs');
const ItemSelector = require('./item-selector/item-selector.js');
const {
    maxCount,
    maxDuplication,
    maxPercentage,
    minCount,
    minPercentage,
} = ItemSelector;

const selector = new ItemSelector({
    'There should be a few used copies available': {
        // Don't want to have a bunch of books that are so rare you can't
        // actually buy them.
        value: ({offer_counts: {used, collectible, refurbished}}) => {
            return used + collectible + refurbished >= 3;
        },
        bounds: [minPercentage(.9)],
    },
    'There should be no more than 2 of the same word in the same section': {
        // Don't want to have 50 books with the same unusual word in the
        // title. But 2 is ok.
        value: item => item.search + ':' + item.major_category,
        bounds: [maxDuplication(2)],
    },
    'Most books should be over 5 years old': {
        // If this is a used bookstore, then we want mostly older materials
        value: ({published_at}) => new Date(published_at).getYear() < new Date().getYear() - 5,
        bounds: [minPercentage(.9)],
    },
    'Most books should be fiction, but there should be a solid chunk of non-fiction': {
        // This store should have
        value: item => item.is_fiction,
        bounds: [minPercentage(.70), maxPercentage(.80)],
    },
});

const pool = collect(JSON.parse(fs.readFileSync(filename)))
    .flatten(1)
    .reject((item) => {
        return /calendar/i.test(item.format)
            || /map/i.test(item.format)
            || !item.offer_counts
            || !item.published_at
            || !item.has_english
            || !item.image
            || item.image.height < 10
            || item.image.width < 10
            || !item.pages
            || item.pages == 1
            || item.is_adult_only
    })
    .all();

const selected = selector.select(pool);

console.log(JSON.stringify(selected));
