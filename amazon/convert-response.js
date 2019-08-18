const collect = require('collect.js');

const all = (object, path) => first(object, path) || [];
const first = (object, path) => collect([object]).pluck(path).filter(Boolean).first();

const toInches = function (measurement) {
    const unit = first(measurement, '$.Units');
    const value = first(measurement, '_');
    if (unit === 'hundredths-inches') {
        return value / 100;
    } else if (unit === 'Inches') {
        return value;
    } else {
        throw new Error('Unknown unit `' + unit + '` in ' + JSON.stringify(measurement));
    }
};

const buildCategoryLists = function (item) {
    const categoryArrays = buildCategoryArrays(first(item, 'BrowseNodes.0.BrowseNode') || []);
    const categories = collect(categoryArrays)
        .flatten()
        .unique()
        .all();
    return {
        categories,
        full_categories: categoryArrays,
    };
};

const buildCategoryArrays = function(nodes) {
    return collect(nodes)
        .map(node => {
            const name = first(node, 'Name.0');
            const ancestors = first(node, 'Ancestors.0.BrowseNode');
            if (!ancestors) {
                return [[name]];
            } else {
                const categoryArrays = buildCategoryArrays(ancestors);
                return categoryArrays.map(categoryArray => [...categoryArray, name]);
            }
        })
        .flatten(1)
        .all();
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

const adultCategories = ['Adult', 'Sex', 'Erotica'];

const looksLikeAdultContent = function (item, categories) {
    return Boolean(Number(first(item, 'ItemAttributes.0.IsAdultProduct.0')))
        || first(item, 'ItemAttributes.0.Format.0') === 'Adult'
        || collect(categories).intersect(adultCategories).length > 0;
}

const getDimensions = function (item) {
    const height = first(item, 'ItemAttributes.0.ItemDimensions.0.Height.0');
    const length = first(item, 'ItemAttributes.0.ItemDimensions.0.Length.0');
    const width = first(item, 'ItemAttributes.0.ItemDimensions.0.Width.0');
    if (height && length && width) {
        return {
            height: toInches(height),
            length: toInches(length),
            width:  toInches(width),
        };
    }
    return null;
};

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
            const image = all(item, 'MediumImage')
                .filter(Boolean)
                .map(image => {
                    return {
                        url: first(image, 'URL.0'),
                        height: Number(first(image, 'Height.0._')),
                        width: Number(first(image, 'Width.0._')),
                    };
                })
                [0];
            const dimensions = getDimensions(item);
            const languages = all(item, 'ItemAttributes.0.Languages.0.Language.0.Name');
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
            let {categories, full_categories} = buildCategoryLists(item);
            categories = categories
                .filter(category => ! ['Books', 'Subjects'].includes(category));
            full_categories = full_categories.map(full_category => {
                return full_category
                    .filter(category => ! ['Books', 'Subjects'].includes(category));
            });
            const is_adult_only = looksLikeAdultContent(item);
            return {
                title: first(item, 'ItemAttributes.0.Title.0'),
                isbn: first(item, 'ItemAttributes.0.ISBN.0'),
                url: first(item, 'DetailPageURL.0'),
                image,
                by: all(item, 'ItemAttributes.0.Author')
                    .concat(all(item, 'ItemAttributes.0.Creator.*._')),
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
                full_categories,
                is_fiction: isFiction(categories),
                search,
            };
        })
        .all();
};
