'use strict';

const collect = require('collect.js');

module.exports = class ItemsSelector {

    constructor(rules) {
        this.rules = rules;
    }

    /**
     * Select items from `pool` such that the results match the rules given and
     * has no more than `count` items.
     * @param  {array} pool
     * @param  {number} count
     * @return {array}
     */
    select(pool, count) {
        pool = collect(pool).shuffle().all();
        const selected = [];
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
            .map((rule, ruleName) => profiles.pluck(ruleName).all())
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
