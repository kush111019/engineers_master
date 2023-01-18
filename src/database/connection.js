const { Pool } = require('pg')
var connection = new Pool({
    host: "localhost",
    user:"postgres",
    password:"postgres",
    database: "hirise_sales1",
    charset: 'utf8mb4'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("database Connected successfully!");
})

module.exports = connection;
