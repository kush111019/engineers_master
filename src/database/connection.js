const { Pool } = require('pg')

var connection = new Pool({
    host: process.env.HOST,
    user:process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    charset: 'utf8mb4'
});
connection.connect(function(err) {
    if (err) throw err;
    console.log("database Connected successfully!");
})

module.exports = connection;
