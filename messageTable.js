const { optionsSQLite3 } = require("./options/config");
const knex = require('knex')(optionsSQLite3);

knex.schema.createTable('messages', table => {
    table.increments("id");
    table.string("email");
    table.string("message");
    table.string("date")
})
    .then(() => console.log('Table created'))
    .catch(err => { throw new Error(err) })
    .finally(() => knex.destroy());
