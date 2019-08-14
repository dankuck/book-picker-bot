const axios = require('axios');
const createHmac = require('create-hmac');
const btoa = require('btoa');
const url = require('url');
const xml2js = require('xml2js').parseString;
const SlowQueue = require('../slow-queue');

const queue = new SlowQueue(process.env.AMAZON_WAIT_TIME || 1100);

module.exports = {
    search(word) {
        const access_key_id = process.env.AMAZON_KEY_ID;
        const secret_key = process.env.AMAZON_KEY_SECRET;
        if (!access_key_id) {
            throw new Error('define AMAZON_KEY_ID in .env');
        }
        if (!secret_key) {
            throw new Error('define AMAZON_KEY_SECRET in .env');
        }
        const domain = 'webservices.amazon.com';
        const path = '/onca/xml';
        const params = {
            'AssociateTag': 'dankuck-20',
            'AWSAccessKeyId': access_key_id,
            'Condition': 'Used',
            'Keywords': word,
            'Operation': 'ItemSearch',
            'ResponseGroup': 'Images,ItemAttributes,Offers',
            'SearchIndex': 'Books',
            'Service': 'AWSECommerceService',
            'Timestamp': new Date().toISOString(),
        };
        const query_keys = Object.keys(params).sort();
        const canonical_query_string = query_keys
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
            .join('&');
        const string_to_sign = `GET\n${domain}\n${path}\n${canonical_query_string}`;
        const hmac = createHmac('sha256', secret_key)
            .update(string_to_sign)
            .digest();
        const signature = btoa(hmac);
        params.Signature = signature;
        const urlString = url.format({
            protocol: 'https:',
            hostname: domain,
            pathname: path,
            query: params,
        });
        return queue
            .getPromise(() => axios.get(urlString))
            .then(response => {
                return new Promise((resolve, reject) => {
                    xml2js(response.data, (err, result) => err ? reject(err) : resolve(result))
                });
            });
    },
};
