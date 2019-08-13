const collect = require('collect.js');

const all = (object, path) => collect([object]).pluck(path).filter(Boolean).all();
const first = (object, path) => all(object, path)[0];

module.exports = function amazonConvertResponse(response) {
    const error = first(response, 'ItemSearchResponse.Items.0.Request.0.Errors.0.Error.0.Message');
    if (error) {
        throw new Error(error);
    }
    return collect([response])
        .pluck('ItemSearchResponse.Items.0.Item.0')
        .map((item) => {
            const image = all(item, 'MediumImage.0')
                .filter(Boolean)
                .map(image => {
                    return {
                        url: first(image, 'URL.0'),
                        height: first(image, 'Height.0._'),
                        width: first(image, 'Width.0._'),
                    };
                })
                [0];
            return {
                ASIN: first(item, 'ASIN.0'),
                url: first(item, 'DetailPageURL.0'),
                image,
                by: all(item, 'ItemAttributes.0.Creator.0._'),
                isbn: first(item, 'ItemAttributes.0.ISBN.0'),
                title: first(item, 'ItemAttributes.0.Title.0'),
                item,
            };
        })
        .all();
};
