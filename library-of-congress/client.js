const axios = require('axios');
const url = require('url');
const collect = require('collect.js');

module.exports = {
    search(word) {
        const endpoint = url.parse('https://www.loc.gov/books/');
        endpoint.query = {q: word, fo: 'json'};
        const urlString = url.format(endpoint);
        return axios.get(urlString)
            .then(response => {
                return response.data.results
                    // .map(({
                    //         title,
                    //         subject,
                    //     }) => {
                    //     return {
                    //         title,
                    //         subjects: subject,
                    //     };
                    // });
            });
    },
};


/**
 * Example response.data[n]:

    {
        "access_restricted": false,
        "site": [
            "catalog"
        ],
        "original_format": [
            "book"
        ],
        "contributor": [
            "rossmann, m. g. (michael g.)",
            "rao, venigalla"
        ],
        "id": "http://lccn.loc.gov/2011941434",
        "partof": [
            "catalog"
        ],
        "subject": [
            "molecular virology",
            "computational biology",
            "molecular machinery",
            "virology",
            "molecular biololgy",
            "configuration, molecular"
        ],
        "index": 1,
        "group": [
            "catalog"
        ],
        "title": "Viral molecular machines",
        "digitized": true,
        "description": [
            "Includes bibliographical references and index."
        ],
        "timestamp": "2017-09-27T05:04:25.707Z",
        "campaigns": [],
        "extract_timestamp": "2017-09-27T05:02:22.675Z",
        "date": "2012",
        "shelf_id": "QR389 .V56 2012",
        "other_title": [],
        "dates": [
            "2012-01-01T00:00:00Z"
        ],
        "language": [
            "english"
        ],
        "url": "//lccn.loc.gov/2011941434",
        "hassegments": false,
        "image_url": [],
        "aka": [
            "http://digitool.hbz-nrw.de:1801/webclient/DeliveryManager?pid=4399264&custom_att_2=simple_viewer",
            "http://www.loc.gov/item/2011941434/",
            "http://lccn.loc.gov/2011941434",
            "http://site.ebrary.com/id/10530921"
        ]
    }

 */
