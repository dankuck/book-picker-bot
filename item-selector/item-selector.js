'use strict';

const collect = require('collect.js');

/**
 |-----------------------------
 | ItemSelector
 |-----------------------------
 |
 | ItemSelector is used to build an array that matches given rules from a pool
 | of potential elements.
 |
 | The rules are given as an object to the constructor.
 |
 | Each rule has a `value` method and an array of `bounds`.
 |
 | The `value` method accepts an element from the pool of potential elements
 | and returns a value that is relevant to this rule.
 |
 | The `bounds` array holds 1 or more functions. Each `bounds` function
 | accepts an array of values for the given rule and returns true if and only
 | if those values meet desired criteria.
 |
 | Example:
 |
 |     // This example creates an ItemSelector that will build arrays that
 |     // have no more than two elements greater than 9.
 |     new ItemSelector({
 |         'only two greater than 9': {
 |             value: (element) => element > 9,
 |             bounds: [
 |                 (values) => values.filter(Boolean).length <= 2,
 |             ],
 |         },
 |     });
 |
 | The same thing could be done more easily with `maxCount` below.
 |
 | There are several functions that can build boundary functions more simply:
 |
 |-----------------------------
 | ItemSelector.maxCount
 |-----------------------------
 | Ensure a certain number or less of elements match the value function.
 |
 | Example:
 |
 |     // Only 2 or less of the result elements should be greater than 9
 |     new ItemSelector({
 |         'only two greater than 9': {
 |             value: (element) => element > 9,
 |             bounds: [ItemSelector.maxCount(2)],
 |         },
 |     });
 |
 |-----------------------------
 | ItemSelector.minCount
 |-----------------------------
 | Ensure a certain number or more of elements match the value function.
 | If there are fewer elements than the given number, then all elements
 | must match the value function.
 |
 | Example:
 |
 |     // At least 2 of the result elements should be greater than 9
 |     new ItemSelector({
 |         'at least two greater than 9': {
 |             value: (element) => element > 9,
 |             bounds: [ItemSelector.minCount(2)],
 |         },
 |     });
 |
 |-----------------------------
 | ItemSelector.maxPercentage
 |-----------------------------
 | Ensure a certain percentage or less of elements match the value function.
 |
 | This rounds up to the nearest whole number. For example, if `percentage`
 | is .25 and there are 10 items, then 3 of them may match. If there is only 1
 | element, then it may or may not match.
 |
 | Because of this rounding, it's possible to include a `maxPercentage` and
 | `minPercentage` in the same bounds array if they are not obviously
 | conflicting.
 |
 | Example:
 |
 |     // Only 10% or less of the result elements should be greater than 9
 |     new ItemSelector({
 |         'only 10% are greater than 9': {
 |             value: (element) => element > 9,
 |             bounds: [ItemSelector.maxPercentage(.1)],
 |         },
 |     });
 |
 |-----------------------------
 | ItemSelector.minPercentage
 |-----------------------------
 | Ensure a certain percentage or more of elements match the value function.
 | If percentage represents less than 1 element, then 1 element needs to
 | match.
 |
 | Example:
 |
 |     // At least 10% of the result elements should be greater than 9
 |     new ItemSelector({
 |         'at least 10% are greater than 9': {
 |             value: (element) => element > 9,
 |             bounds: [ItemSelector.minPercentage(.1)],
 |         },
 |     });
 |
 |-----------------------------
 | ItemSelector.maxDuplication
 |-----------------------------
 | Ensure no more than a certain number of elements return the same value
 | from the value function.
 |
 | Example:
 |
 |     // Only allow 2 items that have any particular category
 |     new ItemSelector({
 |         'only 2 from each category': {
 |             value: (element) => element.category,
 |             bounds: [ItemSelector.maxDuplication(2)],
 |         },
 |     });
 |
 |-----------------------------
 | Tip:
 |
 | Avoid defining bounds which cannot be met by a list with exactly one
 | element. ItemSelector works naively by adding one item at a time, so a
 | rule which requires a minimum of two elements will fail every time the
 | process starts.
 |
 | For example, `minCount` has to take special care if the total is less than
 | the minimum. In that case it only requires that all elements match.
 */
class ItemSelector {

    constructor(rules) {
        this.rules = rules;
    }

    /**
     * Select items from `pool` such that the results match the rules given and
     * has no more than `count` items. Check the length of the array returned
     * if necessary.
     * @param  {array} pool
     * @param  {number} count
     * @param  {array} start_items - usually the results of a call to `select`
     * @return {array}
     */
    select(pool, count = Infinity, start_items = []) {
        pool = collect(pool).shuffle().all();
        const selected = [...start_items];
        let startLength;
        do {
            startLength = selected.length;
            for (let item of pool) {
                if (selected.includes(item)) {
                    continue;
                }
                const profiles = [...selected, item].map(item => this.buildProfile(item));
                const compiled = this.compileProfiles(profiles);
                if (this.valuesAreWithinBounds(compiled)) {
                    selected.push(item);
                }
                if (selected.length >= count) {
                    break;
                }
            }
        } while (selected.length !== startLength && selected.length < count);
        return selected;
    }

    /**
     * Return an object containing the value response for each rule for the
     * given item
     * @param  {object} item
     * @return {object}
     */
    buildProfile(item) {
        return collect(this.rules)
            .map(rule => {
                return rule.value(item);
            })
            .all();
    }

    /**
     * Turn an array of profile objects into an object of arrays of rule values
     * @param  {array} profiles
     * @return {object}
     */
    compileProfiles(profiles) {
        profiles = collect(profiles);
        return collect(this.rules)
            .map((rule, ruleName) => {
                return profiles
                    .reduce((acc, profile) => acc.concat(profile[ruleName]), []);
            })
            .all();
    }

    /**
     * Check that all bounds match for the values in the compiled object
     * @param  {object} compiled
     * @return {boolean}
     */
    valuesAreWithinBounds(compiled) {
        return collect(this.rules)
            .reduce((withinBounds, rule, ruleName) => {
                return rule.bounds
                    .reduce((withinBounds, bound) => {
                        return withinBounds && bound(compiled[ruleName]);
                    }, withinBounds);
            }, true);
    }
};

/**
 * Returns a function that evaluates to true IFF the true values of the given
 * array are less than or equal to `percentage` of the full length of the array
 *
 * This rounds to the next whole number. For exmaple, if `percentage` is .6 and
 * the length is 8, then at most 5 may be true, rounded up from 4.8.
 *
 * @param  {float} percentage value from 0 to 1
 * @return {Function}
 */
ItemSelector.maxPercentage = function maxPercentage(percentage) {
    return (values) => {
        const number = Math.ceil(percentage * values.length);
        const max = ItemSelector.maxCount(number);
        return max(values);
    };
};

/**
 * Returns a function that evaluates to true IFF the truthy values of the given
 * array are greater than or equal to `percentage` of the full length of the
 * array.
 * @param  {float} percentage value from 0 to 1
 * @return {Function}
 */
ItemSelector.minPercentage = function minPercentage(percentage) {
    return (values) => {
        const number = Math.ceil(percentage * values.length);
        const min = ItemSelector.minCount(number);
        return min(values);
    };
};

/**
 * Returns a function that evaluates to true IFF `number` or fewer values of
 * the given array are truthy
 * @param  {number} number
 * @return {Function}
 */
ItemSelector.maxCount = function maxCount(number) {
    return (values) => values.filter(Boolean).length <= number;
};

/**
 * Returns a function that evaluates to true IFF `number` or more values of
 * the given array are truthy, or if there are not enough elements, then only
 * if all values are truthy
 * @param  {number} number
 * @return {Function}
 */
ItemSelector.minCount = function minCount(number) {
    return (values) => {
        if (values.length < number) {
            return values.filter(Boolean).length === values.length;
        } else {
            return values.filter(Boolean).length >= number;
        }
    }
};

/**
 * Returns a function that evaluates to true IFF each element of the given
 * array is present `number` or fewer times.
 * @param  {number} number
 * @return {Function}
 */
ItemSelector.maxDuplication = function maxDuplication(number) {
    return (values) => ! collect(values)
        .groupBy(value => value)
        .first((values) => values.count() > number);
};

module.exports = ItemSelector;
