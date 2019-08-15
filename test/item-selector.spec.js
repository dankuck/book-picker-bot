const ItemSelector = require('../item-selector/item-selector.js');
const assert = require('assert');
const {deepStrictEqual} = require('assert');

const {
    maxCount,
    maxDuplication,
    maxPercentage,
    minCount,
    minPercentage,
} = ItemSelector;

describe('item-selector.js', function () {

    it('should exist', function () {
        assert(new ItemSelector({}));
    });

    it('should have a maxPercentage boundary builder', function () {
        const maxHalf = maxPercentage(.5);
        const isMaxHalf = maxHalf([true, false]);
        assert(isMaxHalf === true);
        const isNotMaxHalf = maxHalf([true]);
        assert(isNotMaxHalf === false);

        const maxZero = maxPercentage(0);
        const isMaxZero = maxZero([false]);
        assert(isMaxZero === true);
        const isNotMaxZero = maxZero([true]);
        assert(isNotMaxZero === false);
    });

    it('should have a maxCount boundary builder', function () {
        const max2 = maxCount(2);
        const isMax2 = max2([true, true, false]);
        assert(isMax2 === true);
        const isNotMax2 = max2([true, true, true, false]);
        assert(isNotMax2 === false);

        const maxZero = maxCount(0);
        const isMaxZero = maxZero([false]);
        assert(isMaxZero === true);
        const isNotMaxZero = maxZero([true]);
        assert(isNotMaxZero === false);
    });

    it('should have a maxDuplication boundary builder', function () {
        const maxDup2 = maxDuplication(2);
        const isMaxDup2 = maxDup2([
            'cat', 'cat',
            'dog',
            'turtle',
        ]);
        assert(isMaxDup2 === true);
    });

    it('should have a minCount boundary builder', function () {
        const min2 = minCount(2);
        const isMin2 = min2([true, true, false]);
        assert(isMin2 === true);
        const isNotMin2 = min2([true, false, false]);
        assert(isNotMin2 === false);
        const isBecauseAll = min2([true]);
        assert(isBecauseAll === true);
    });

    it('should have a minPercentage boundary builder', function () {
        const min30 = minPercentage(.3);
        const isMin30 = min30([true, false, false]);
        assert(isMin30 === true);
        const isNotMin30 = min30([false, false, false, false]);
        assert(isNotMin30 === false);
        const isBecauseTooSmall = min30([true, false]);
        assert(isBecauseTooSmall === true);
    });

    it('should build a profile of an item', function () {
        const selector = new ItemSelector({
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
        const selector = new ItemSelector({
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
        const selector = new ItemSelector({
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
        const selector = new ItemSelector({
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
        const selector = new ItemSelector({
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
        assert(greaterThan9.length <= 1);
        deepStrictEqual(20, selections.length);
    });

    it('should return [] if boundaries cannot be met', function () {
        const selector = new ItemSelector({
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

    it('should return as many values as possible by default', function () {
        const selector = new ItemSelector({
            greaterThan9: {
                value: item => item.x > 9,
                bounds: [maxCount(0)],
            },
        });
        const pool = [
            // greater than 9
            {x: 10}, {x: 11}, {x: 12}, {x: 13}, {x: 14},
            {x: 15},
            // 18 less than or equal to 9
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
        ];
        const selections = selector.select(pool);
        deepStrictEqual(18, selections.length);
    });

    it('should require a minimum count to match', function () {
        const selector = new ItemSelector({
            greaterThan9: {
                value: item => item.x > 9,
                bounds: [minCount(3)],
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
        deepStrictEqual(10, selections.length);
        assert(greaterThan9.length >= 3);
    });

    it('should require a minimum percentage to match', function () {
        const selector = new ItemSelector({
            greaterThan9: {
                value: item => item.x > 9,
                bounds: [minPercentage(.1)],
            },
        });
        const pool = [
            // greater than 9
            {x: 10},
            // less than or equal to 9
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
        ];
        const selections = selector.select(pool, 10);
        const greaterThan9 = selections.filter(item => item.x > 9);
        deepStrictEqual(10, selections.length);
        deepStrictEqual(1, greaterThan9.length);
    });

    it('should require a minimum of 10% to match even when 10% is less than 1 element', function () {
        const selector = new ItemSelector({
            greaterThan9: {
                value: item => item.x > 9,
                bounds: [minPercentage(.1)],
            },
        });
        const pool = [
            // greater than 9
            {x: 10},
            // less than or equal to 9
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
        ];
        const selections = selector.select(pool, 5);
        const greaterThan9 = selections.filter(item => item.x > 9);
        deepStrictEqual(5, selections.length);
        deepStrictEqual(1, greaterThan9.length);
    });

    it('should require a minimum of 10% to match when 10% is large', function () {
        const selector = new ItemSelector({
            greaterThan9: {
                value: item => item.x > 9,
                bounds: [minPercentage(.1)],
            },
        });
        const pool = [
            // greater than 9
            {x: 10},
            // less than or equal to 9
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},

            // +4 copies
            {x: 10},
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
            {x: 10},
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
            {x: 10},
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
            {x: 10},
            {x: 1}, {x: 2}, {x: 3}, {x: 4}, {x: 5},
            {x: 6}, {x: 7}, {x: 8}, {x: 9},
        ];
        const selections = selector.select(pool, 25);
        const greaterThan9 = selections.filter(item => item.x > 9);
        deepStrictEqual(25, selections.length);
        assert(greaterThan9.length >= 2.5, 'only got ' + greaterThan9.length);
    });

    it('should require an exact number using min and max counts', function () {
        const selector = new ItemSelector({
            greaterThan9: {
                value: item => item.x > 9,
                bounds: [minCount(3), maxCount(3)],
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
        deepStrictEqual(10, selections.length);
        deepStrictEqual(3, greaterThan9.length);
    });

    it('should result in the smaller number if min and max count conflict', function () {
        const selector = new ItemSelector({
            greaterThan9: {
                value: item => item.x > 9,
                bounds: [minCount(4), maxCount(2)],
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
        deepStrictEqual(2, selections.length);
    });
});
