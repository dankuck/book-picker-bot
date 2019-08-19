const {
    maxCount,
    maxDuplication,
    maxPercentage,
    minCount,
    minPercentage,
} = require('./item-selector/item-selector.js');

const categorize = function categorize(item) {
    const categories = item.categories.join(' ');
    if (/children/i.test(categories)) {
        return 'Children';
    } else if (item.is_fiction) {
        if (/science/i.test(categories)) {
            return 'Science Fiction';
        } else {
            return 'Literature';
        }
    } else {
        if (/help/i.test(categories)) {
            return 'Self Help';
        } else if (/religion|christian|buddh|jewish|muslim|islam/i.test(categories)) {
            return 'Religion';
        } else {
            return 'Reference';
        }
    }
};

module.exports = {
    rules: {
        'There should be a few used copies available': {
            value: ({offer_counts: {used, collectible, refurbished}}) => {
                return used + collectible + refurbished >= 3;
            },
            bounds: [minPercentage(.9)],
        },
        'There should be no more than 2 of the same search term in the same section': {
            value: item => item.search + ':' + categorize(item),
            bounds: [maxDuplication(2)],
        },
        'Most books should be over 5 years old': {
            value: ({published_at}) => new Date(published_at).getYear() < new Date().getYear() - 5,
            bounds: [minPercentage(.9)],
        },
        'Most books should be fiction, but there should be a solid chunk of non-fiction': {
            value: item => item.is_fiction,
            bounds: [
                minPercentage(.50),
                maxPercentage(.80),
            ],
        },
    },
    reject: (item) => {
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
    },
    categorize,
};
