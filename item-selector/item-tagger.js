const dedupe = array => Array.from(new Set(array));

/**
 |-----------------------------
 | ItemTagger
 |-----------------------------
 | Adds a `tag` array element to each item, using the tags from matching rules.
 |
 */
class ItemTagger
{
    constructor(rules)
    {
        this.rules = Object.values(rules)
            .filter(rule => rule.tags);
    }

    tag(items)
    {
        items.forEach(item => {
            const tags = item.tags || [];
            const newTags = this.rules
                .filter(rule => rule.value(item))
                .map(rule => rule.tags);
            item.tags = dedupe(tags.concat(...newTags));
        });
        return items;
    }
};

module.exports = ItemTagger;
