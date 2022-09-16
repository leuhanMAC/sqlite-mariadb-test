const { optionsMariaDB } = require("./options/config");
const knex = require('knex')(optionsMariaDB);

knex.schema.createTable('products', table => {
    table.increments("id");
    table.string("title");
    table.float("price");
    table.string("thumbnail")
})
    .then(() => console.log('Table created'))
    .catch(err => { throw new Error(err) })
    .finally(() => knex.destroy());