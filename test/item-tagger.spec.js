const ItemTagger = require('../item-selector/item-tagger.js');
const assert = require('assert');
const {deepStrictEqual: equal} = require('assert');

describe('ItemTagger', function () {

    it('should instantiate', function () {
        new ItemTagger({});
    });

    it('should tag something', function () {
        const items = new ItemTagger({
                'some rule': {
                    value: () => true,
                    tags: ['xyz'],
                },
            })
            .tag([
                {
                    x: 'my item',
                },
            ]);
        equal([{x: 'my item', tags: ['xyz']}], items);
    });

    it('should empty tag something', function () {
        const items = new ItemTagger({
                'some rule': {
                    value: () => false,
                    tags: ['xyz'],
                },
            })
            .tag([
                {
                    x: 'my item',
                },
            ]);
        equal([{x: 'my item', tags: []}], items);
    });

    it('should tag something but the tags are empty', function () {
        const items = new ItemTagger({
                'some rule': {
                    value: () => true,
                    tags: [],
                },
            })
            .tag([
                {
                    x: 'my item',
                },
            ]);
        equal([{x: 'my item', tags: []}], items);
    });

    it('should be fine with rules without tags', function () {
        const items = new ItemTagger({
                'some rule': {
                    value: () => true,
                },
            })
            .tag([
                {
                    x: 'my item',
                },
            ]);
        equal([{x: 'my item', tags: []}], items);
    });

    it('should add all tags', function () {
        const items = new ItemTagger({
                'some rule': {
                    value: () => true,
                    tags: ['xyz', 'abc'],
                },
            })
            .tag([
                {
                    x: 'my item',
                },
            ]);
        equal([{x: 'my item', tags: ['xyz', 'abc']}], items);
    });

    it('should add tags to existing tags', function () {
        const items = new ItemTagger({
                'some rule': {
                    value: () => true,
                    tags: ['xyz', 'abc'],
                },
            })
            .tag([
                {
                    x: 'my item',
                    tags: ['def'],
                },
            ]);
        equal([{x: 'my item', tags: ['def', 'xyz', 'abc']}], items);
    });

    it('should add tags from all matches', function () {
        const items = new ItemTagger({
                'some rule': {
                    value: () => true,
                    tags: ['xyz'],
                },
                'other rule': {
                    value: () => true,
                    tags: ['abc']
                },
            })
            .tag([
                {
                    x: 'my item',
                },
            ]);
        equal([{x: 'my item', tags: ['xyz', 'abc']}], items);
    });

    it('should add tags from just matches', function () {
        const items = new ItemTagger({
                'some rule': {
                    value: () => true,
                    tags: ['xyz'],
                },
                'other rule': {
                    value: () => false,
                    tags: ['abc']
                },
            })
            .tag([
                {
                    x: 'my item',
                },
            ]);
        equal([{x: 'my item', tags: ['xyz']}], items);
    });

    it('should add tags to all items', function () {
        const items = new ItemTagger({
                'some rule': {
                    value: () => true,
                    tags: ['xyz'],
                },
            })
            .tag([
                {
                    x: 'my item',
                },
                {
                    x: 'not my item',
                    tags: ['def'],
                },
            ]);
        const expected = [
            {x: 'my item', tags: ['xyz']},
            {x: 'not my item', tags: ['def', 'xyz']},
        ];
        equal(expected, items);
    });

    it('should de-duplicate tags', function () {
        const items = new ItemTagger({
                'some rule': {
                    value: () => true,
                    tags: ['xyz'],
                },
                'some other rule': {
                    value: () => true,
                    tags: ['xyz', 'xyz'],
                },
            })
            .tag([
                {
                    x: 'my item',
                },
                {
                    x: 'not my item',
                    tags: ['xyz'],
                },
                {
                    x: '3rd item',
                    tags: ['xyz', 'xyz'],
                },
            ]);
        const expected = [
            {x: 'my item', tags: ['xyz']},
            {x: 'not my item', tags: ['xyz']},
            {x: '3rd item', tags: ['xyz']},
        ];
        equal(expected, items);
    });
});
