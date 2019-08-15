
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
    lotsOfUsedAvailability: {
        // Don't want to have a bunch of books that are so rare you can't
        // actually buy them.
        value: ({offer_counts: {used, collectible, refurbished}}) => {
            return used + collectible + refurbished >= 3;
        },
        bounds: [minPercentage(.9)],
    },
    notTooMuchOfTheSameSearch: {
        // Don't want to have 50 books with the same unusual word in the
        // title. But 2 is ok.
        value: item => item.search,
        bounds: [maxDuplication(2)],
    },
    mostlyOver5YearsOld: {
        value: ({published_at}) => new Date(published_at).getYear() < new Date().getYear() - 5,
        bounds: [minPercentage(.9)],
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
    })
    .all();

const selected = selector.select(pool, 10);

console.log(JSON.stringify(selected));
