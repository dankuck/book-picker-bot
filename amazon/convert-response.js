const collect = require('collect.js');

const all = (object, path) => collect([object]).pluck(path).filter(Boolean).all();
const first = (object, path) => all(object, path)[0];

const toInches = function (measurement) {
    const unit = first(measurement, '$.Units');
    const value = first(measurement, '_');
    if (unit === 'hundredths-inches') {
        return value / 100;
    } else {
        throw new Error('Unknown unit `' + unit + '` in ' + JSON.stringify(measurement));
    }
};

const buildCategoryList = function (item) {
    let queue = all(item, 'BrowseNodes.0.BrowseNode.0');
    const categories = [];
    while (queue.length > 0) {
        const node = queue.pop();
        categories.push(first(node, 'Name.0'));
        queue = queue.concat(all(node, 'Ancestors.0.BrowseNode.0'));
    }
    return categories;
};

const isFiction = function (categories) {
    const fiction = /fiction|fantasy/i;
    const nonfiction = /non\-?fiction/i;
    return categories
        .reduce(
            (alreadyTrue, category) => alreadyTrue
                || (fiction.test(category) && ! nonfiction.test(category)),
            false
        );
};

const adultCategories = ['Adult', 'Sex'];

const looksLikeAdultContent = function (item, categories) {
    return Boolean(Number(first(item, 'ItemAttributes.0.IsAdultProduct.0')))
        || first(item, 'ItemAttributes.0.Format.0') === 'Adult'
        || collect(categories).intersect(adultCategories).length > 0;
}

module.exports = function amazonConvertResponse(response, search) {
    const error = first(response, 'ItemSearchResponse.Items.0.Request.0.Errors.0.Error.0.Message');
    if (error) {
        throw new Error(error);
    }
    return collect([response])
        .pluck('ItemSearchResponse.Items.0.Item')
        .map(x => x || [])
        .flatten(1)
        .map((item) => {
            const image = all(item, 'MediumImage.0')
                .filter(Boolean)
                .map(image => {
                    return {
                        url: first(image, 'URL.0'),
                        height: Number(first(image, 'Height.0._')),
                        width: Number(first(image, 'Width.0._')),
                    };
                })
                [0];
            const dimensions = first(item, 'ItemAttributes.0.ItemDimensions.0.Height.0')
                ? {
                    height: toInches(first(item, 'ItemAttributes.0.ItemDimensions.0.Height.0')),
                    length: toInches(first(item, 'ItemAttributes.0.ItemDimensions.0.Length.0')),
                    width: toInches(first(item, 'ItemAttributes.0.ItemDimensions.0.Width.0')),
                }
                : null;
            const languages = all(item, 'ItemAttributes.0.Languages.0.Language.0.Name.0');
            const offer_counts = first(item, 'OfferSummary.0.TotalNew.0')
                ? {
                    'new': Number(first(item, 'OfferSummary.0.TotalNew.0')),
                    'used': Number(first(item, 'OfferSummary.0.TotalUsed.0')),
                    'collectible': Number(first(item, 'OfferSummary.0.TotalCollectible.0')),
                    'refurbished': Number(first(item, 'OfferSummary.0.TotalRefurbished.0')),
                }
                : null;
            const published_at = first(item, 'ItemAttributes.0.PublicationDate.0')
                ? new Date(first(item, 'ItemAttributes.0.PublicationDate.0'))
                : null;
            const categories = buildCategoryList(item)
                .filter(category => ! ['Books', 'Subjects'].includes(category));
            const is_adult_only = looksLikeAdultContent(item);
            return {
                title: first(item, 'ItemAttributes.0.Title.0'),
                isbn: first(item, 'ItemAttributes.0.ISBN.0'),
                url: first(item, 'DetailPageURL.0'),
                image,
                by: all(item, 'ItemAttributes.0.Author.0')
                    .concat(all(item, 'ItemAttributes.0.Creator.0._')),
                is_adult_only,
                dimensions,
                languages,
                has_english: languages.includes('English'),
                pages: Number(first(item, 'ItemAttributes.0.NumberOfPages.0')),
                published_at,
                format: first(item, 'ItemAttributes.0.Format.0'),
                is_memorabilia: Boolean(Number(first(item, 'ItemAttributes.0.IsMemorabilia.0'))),
                prices: {
                    'new': first(item, 'OfferSummary.0.LowestNewPrice.0.FormattedPrice.0'),
                    'used': first(item, 'OfferSummary.0.LowestUsedPrice.0.FormattedPrice.0'),
                    'collectible': first(item, 'OfferSummary.0.LowestCollectiblePrice.0.FormattedPrice.0'),
                },
                offer_counts,
                categories,
                major_category: collect(categories).last() || '',
                is_fiction: isFiction(categories),
                search,
            };
        })
        .all();
};
