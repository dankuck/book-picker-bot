const axios = require('axios');
const url = require('url');

module.exports = {
    search(word) {
        const endpoint = url.parse('https://www.loc.gov/search/');
        endpoint.query = {q: word, fo: 'json'};
        const urlString = url.format(endpoint);
        return axios.get(urlString)
            .then(response => {
                const data = response.data;
                return data.results;
            });
    },
};
