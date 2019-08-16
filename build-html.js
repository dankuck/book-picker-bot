
require('dotenv').config();

const filename = process.argv[2] || (() => {throw new Error('No filename provided')})();

const collect = require('collect.js');
const fs = require('fs');

const selected = JSON.parse(fs.readFileSync(filename));

const cards = collect(selected)
    .groupBy(item => item.is_fiction ? 'Fiction' : 'Non-fiction')
    .map((group, groupName) => {
        const fictionOrNonHtml = group
            .groupBy(item => item.categories.slice(-3, -2)[0] || '') // third-to-last
            .map((group, groupName) => {
                const itemsHtml = group
                    .map(item => {
                        return `
                            <div class="col-3">
                                <img src="${item.image.url}" />
                                <h5>${item.title}</h5>
                            </div>
                        `;
                    })
                    .join("\n");
                return `
                    <div class="row">
                        <h2>${groupName || 'Misc'}</h2>
                    </div>
                    <div class="row">
                        ${itemsHtml}
                    </div>
                `;
            })
            .join("\n");
        return `
            <div class="row">
                <h1>${groupName}</h1>
            </div>
            ${fictionOrNonHtml}
        `;
    })
    .join("\n");

console.log(`
<html>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <body>
        <div class="container">
            ${cards}
        </div>
    </body>
</html>
`);
