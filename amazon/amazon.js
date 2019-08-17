const axios = require('axios');
const createHmac = require('create-hmac');
const btoa = require('btoa');
const url = require('url');
const xml2js = require('xml2js').parseString;
const SlowQueue = require('../utils/slow-queue');
const AmazonClient = require('./client.js');

const queue = new SlowQueue(process.env.AMAZON_WAIT_TIME || 1100);

['AMAZON_KEY_ID', 'AMAZON_KEY_SECRET', 'AMAZON_ASSOCIATE_TAG']
    .forEach(property => {
        if (!process.env[property]) {
            throw new Error(`Define ${property} in .env`);
        }
    });

const access_key_id = process.env.AMAZON_KEY_ID;
const secret_key = process.env.AMAZON_KEY_SECRET;
const associate_tag = process.env.AMAZON_ASSOCIATE_TAG;

const client = new AmazonClient(access_key_id, secret_key);

const parseXml = xml => new Promise((resolve, reject) => {
    xml2js(xml, (err, result) => err ? reject(err) : resolve(result))
});

module.exports = {
    search(words) {
        if (! (words instanceof Array)) {
            const word = words;
            return this.search([word])
                .then(results => results[0]);
        }
        return queue
            .push(() => {
                const promises = words
                    .map(word => {
                        return client
                            .search({
                                'AssociateTag':  associate_tag,
                                'Condition':     'Used',
                                'Keywords':      word,
                                'Operation':     'ItemSearch',
                                'ResponseGroup': 'Images,ItemAttributes,Offers,BrowseNodes',
                                'SearchIndex':   'Books',
                                'Service':       'AWSECommerceService',
                            })
                            .then(response => parseXml(response.data));
                    });
                return Promise.all(promises)
            });
    }
};
