const fs = require('fs');
const collect = require('collect.js');
const amazonConvertResponse = require('../amazon/convert-response');
const assert = require('assert');

const getTestData = function (filename) {
    return JSON.parse(fs.readFileSync(__dirname + '/fixtures/' + filename))
};

describe('amazon/convert-response.js', function () {

    it('can convert Amazon XML-to-js structure into our preferred structure', function () {
        const {results, word} = getTestData('amazon-response-stormy.json');
        const items = amazonConvertResponse(results, word);
        assert(items.length === 10);
    });

    it('throws an exception if nothing is found', function () {
        const {results, word} = getTestData('amazon-response-unguiform.json');
        let caught;
        try {
            amazonConvertResponse(results, word);
        } catch (e) {
            caught = e;
        }
        assert(/We did not find any matches for your request/.test(caught));
    });

    it('matches a known-good result', function () {
        const {results, word} = getTestData('amazon-response-leathery.json');
        const [item] = amazonConvertResponse(results, word);
        const correct = {
            "url": "https://www.amazon.com/Mushrooms-Great-Lake-Region-Wisconsin/dp/1446519716?SubscriptionId=AKIAIOY4QZDWXZXIEAKA&tag=dankuck-20&linkCode=xm2&camp=2025&creative=165953&creativeASIN=1446519716",
            "image": {
                "url": "https://images-na.ssl-images-amazon.com/images/I/51-sp1mcBtL._SL160_.jpg",
                "height": 160,
                "width": 104
            },
            "small_image": {
                "height": 75,
                "url": "https://images-na.ssl-images-amazon.com/images/I/51-sp1mcBtL._SL75_.jpg",
                "width": 49,
            },
            "large_image": {
                "height": 500,
                "url": "https://images-na.ssl-images-amazon.com/images/I/51-sp1mcBtL.jpg",
                "width": 324,
            },
            "by": [
                "Verne Ovid Graham"
            ],
            "isbn": "1446519716",
            "title": "Mushrooms of the Great Lake Region - The Fleshy, Leathery, and Woody Fungi of Illinois, Indiana, Ohio and the Southern Half of Wisconsin and of Michigan",
            "is_adult_only": false,
            "format": undefined,
            "dimensions": {
                "height": 8.5,
                "length": 5.5,
                "width": 1.29
            },
            "languages": [
                "English"
            ],
            "has_english": true,
            "pages": 516,
            "published_at": new Date("2015-05-13T00:00:00.000Z"),
            "is_memorabilia": false,
            "prices": {
                "new": "$32.03",
                "used": "$44.00",
                "collectible": undefined,
            },
            "offer_counts": {
                "new": 6,
                "used": 8,
                "collectible": 0,
                "refurbished": 0
            },
            "categories": [
                "Books",
                "Subjects",
                "Science & Math",
                "Biological Sciences",
                "Plants",
                "Mushrooms",
                "Travel",
                "United States",
                "Midwest",
            ],
            "full_categories": [
                [
                    "Books",
                    "Subjects",
                    "Science & Math",
                    "Biological Sciences",
                    "Plants",
                    "Mushrooms",
                ],
                [
                    "Books",
                    "Subjects",
                    "Travel",
                    "United States",
                    "Midwest",
                ],
            ],
            "is_fiction": false,
            "search": "leathery"
        };
        assert.deepStrictEqual(correct, item, 'Item did not convert as expected');
    });

    it.skip('gets all categories', function () {
        // test against fixtures/amazon-response-zoogeographical.json which has children category nodes
    });

    it('matches a known-bad result', function () {
        const items = amazonConvertResponse({}, '');
        assert(items.length === 0);
    });

    it('gets is_adult_only correct', function () {
        const {results, word} = getTestData('amazon-response-agonist.json');
        const items = amazonConvertResponse(results, word);
        for (let item of items) {
            assert(item.is_adult_only === false, 'This one claims to be adult only: ' + JSON.stringify(item));
        }
    });
});
