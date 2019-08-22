
require('dotenv').config();

const filename = process.argv[2] || (() => {throw new Error('No filename provided')})();

const collect = require('collect.js');
const fs = require('fs');
const {categorize} = require('./rules.js');

const selected = JSON.parse(fs.readFileSync(filename));

const cards = collect(selected)
    .groupBy(item => categorize(item))
    .map((group, groupName) => {
        const itemsHtml = group
            .map(item => {
                return `
                    <div class="col-6 col-md-3">
                        <img src="${item.image.url}" />
                        <h5>${item.title}</h5>
                    </div>
                `;
            })
            .join("\n");
        return `
            <div class="row">
                <div class="col-3 col-md-1" style="background-color:white">
                    <h2 class="sticky-top" style="transform: rotate(90deg);white-space:nowrap;padding-left: 3em;">
                        ${groupName || 'Misc'} (${group.count()})
                    </h2>
                </div>
                <div class="col-9 col-md-11">
                    <div class="container">
                        <div class="row">
                            ${itemsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join("\n");

console.log(`
<html>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
    </style>
    <body>
        <div class="container">
            ${selected.length} books
            ${cards}
        </div>
    </body>
</html>
`);
