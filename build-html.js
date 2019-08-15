
require('dotenv').config();

const filename = process.argv[2] || (() => {throw new Error('No filename provided')})();

const collect = require('collect.js');
const fs = require('fs');

const selected = JSON.parse(fs.readFileSync(filename));

const cards = selected
    .map(item => {
        return `
            <div class="col-3">
                <img src="${item.image.url}" />
                <h5>${item.title}</h5>
            </div>
        `;
    })
    .join("\n");

console.log(`
<html>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <body>
        <div class="container">
            <div class="row">
                ${cards}
            </div>
        </div>
    </body>
</html>
`);
