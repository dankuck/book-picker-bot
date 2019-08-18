
module.exports = function categorize(item) {
    const categories = item.categories.join(' ');
    if (/children/i.test(categories)) {
        return 'Children';
    } else if (item.is_fiction) {
        if (/science/i.test(categories)) {
            return 'Science Fiction';
        } else if (/horror/i.test(categories)) {
            return 'Horror';
        } else if (/adventure/i.test(categories)) {
            return 'Adventure';
        } else {
            return 'Literature';
        }
    } else {
        if (/help/i.test(categories)) {
            return 'Self Help';
        } else if (/religion|christian|buddh|jewish|muslim|islam/i.test(categories)) {
            return 'Religion';
        } else {
            return 'Reference';
        }
    }
};
