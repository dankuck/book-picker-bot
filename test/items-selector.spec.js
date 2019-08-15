const ItemsSelector = require('../items-selector/items-selector.js');
const assert = require('assert');
const {deepStrictEqual} = require('assert');

const maxPercentage = function maxPercentage(percentage) {
    return (values) =>
        values.filter(Boolean).length / values.length
        <= percentage;
};

const maxCount = function maxCount(number) {
    return (values) => values.filter(Boolean).length <= number;
};

describe('items-selector.js', function () {

    it('should exist', function () {
        assert(new ItemsSelector({}));
    });

    it('should build a profile of an item', function () {
        const selector = new ItemsSelector({
            greaterThan9: {
                value: item => item.x > 9,
                bounds: [maxPercentage(.1)],
            },
        });
        const trueProfile = selector.buildProfile({x: 10});
        const trueCorrect = {
            greaterThan9: true,
        };
        deepStrictEqual(trueCorrect, trueProfile);
        const falseProfile = selector.buildProfile({x: 9});
        const falseCorrect = {
            greaterThan9: false,
        };
        deepStrictEqual(falseCorrect, falseProfile);
    });

    it('should build values of profiles', function () {
        const selector = new ItemsSelector({
            x: {
                // value: doesn't matter
                bounds: [maxPercentage(.1)],
            },
        });
        const counts = selector.compileProfiles([
            {
                x: 1,
            },
            {
                x: 2,
            },
            {
                x: 8,
            },
        ])
        const correct = {
            x: [1, 2, 8],
        };
        deepStrictEqual(correct, counts);
    });

    it('should check if counts are within bounds', function () {
        const selector = new ItemsSelector({
            x: {
                // value: doesn't matter
                bounds: [maxPercentage(.1)],
            },
        });
        const shouldBeWithinBounds = selector.valuesAreWithinBounds({
            x: [
                true,
                false, false, false, false, false,
                false, false, false, false,
            ],
        });
        assert(shouldBeWithinBounds === true);
        const shouldNotBeWithinBounds = selector.valuesAreWithinBounds({
            x: [
                true, true,
                false, false, false, false, false,
                false, false, false,
            ],
        });
        assert(shouldNotBeWithinBounds === false);
    });

    it('should select items matching the bounds given', function () {
        const selector = new ItemsSelector({
            greaterThan9: {
                value: item => item.x > 9,
                bounds: [maxPercentage(.1)],
            },
        });
        const pool = [
            // greater than 9
            {x: 10}, {x: 11}, {x: 12}, {x: 13}, {x: 14},
            {x: 15},
            // less than or equal to 9
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
        ];
        const selections = selector.select(pool, 10);
        const greaterThan9 = selections.filter(item => item.x > 9);
        deepStrictEqual(1, greaterThan9.length);
        deepStrictEqual(10, selections.length);
    });

    it('should obey two boundaries', function () {
        const selector = new ItemsSelector({
            greaterThan9: {
                value: item => item.x > 9,
                bounds: [maxPercentage(.1), maxCount(1)],
            },
        });
        const pool = [
            // 6 greater than 9
            {x: 10}, {x: 11}, {x: 12}, {x: 13}, {x: 14},
            {x: 15},
            // 36 less than or equal to 9
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
        ];
        const selections = selector.select(pool, 20);
        const greaterThan9 = selections.filter(item => item.x > 9);
        deepStrictEqual(1, greaterThan9.length);
        deepStrictEqual(20, selections.length);
    });

    it('should return [] if boundaries cannot be met', function () {
        const selector = new ItemsSelector({
            greaterThan9: {
                value: item => item.x > 9,
                bounds: [maxCount(0)],
            },
        });
        const pool = [
            // all greater than 9
            {x: 10}, {x: 11}, {x: 12}, {x: 13}, {x: 14},
            {x: 15},
            // none less than or equal to 9
        ];
        const selections = selector.select(pool, 10);
        deepStrictEqual([], selections);
    });
});
