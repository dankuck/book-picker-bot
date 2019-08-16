const axios = require('axios');
const createHmac = require('create-hmac');
const btoa = require('btoa');
const url = require('url');
const xml2js = require('xml2js').parseString;
const SlowQueue = require('../utils/slow-queue');
const AmazonClient = require('./client.js');

const queue = new SlowQueue(process.env.AMAZON_WAIT_TIME || 1100);

const access_key_id = process.env.AMAZON_KEY_ID;
const secret_key = process.env.AMAZON_KEY_SECRET;
if (!access_key_id) {
    throw new Error('define AMAZON_KEY_ID in .env');
}
if (!secret_key) {
    throw new Error('define AMAZON_KEY_SECRET in .env');
}

const client = new AmazonClient(access_key_id, secret_key);

const parseXml = xml => new Promise((resolve, reject) => {
    xml2js(xml, (err, result) => err ? reject(err) : resolve(result))
});

module.exports = {
    search(word) {
        return queue
            .getPromise(() => {
                return client.search({
                    'AssociateTag': 'dankuck-20',
                    'Condition': 'Used',
                    'Keywords': word,
                    'Operation': 'ItemSearch',
                    'ResponseGroup': 'Images,ItemAttributes,Offers,BrowseNodes',
                    'SearchIndex': 'Books',
                    'Service': 'AWSECommerceService',
                });
            })
            .then(response => parseXml(response.data));
    },
};
