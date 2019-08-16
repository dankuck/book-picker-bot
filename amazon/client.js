const axios = require('axios');
const createHmac = require('create-hmac');
const btoa = require('btoa');
const url = require('url');

module.exports = class AmazonClient
{
    constructor(access_key_id, secret_key) {
        this.search = function(params) {
            params = {
                ...params,
                'AWSAccessKeyId': access_key_id,
                'Timestamp': new Date().toISOString(),
            };
            const domain = 'webservices.amazon.com';
            const path = '/onca/xml';
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
            return axios.get(urlString);
        };
    }
};
