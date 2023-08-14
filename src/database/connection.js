const { Pool } = require('pg')
console.log(process.env.HOST,process.env.USER,process.env.PASSWORD,process.env.DATABASE)
var connection = new Pool({
    host: process.env.HOST,
    user: "postgres",
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    charset: 'utf8mb4'
});
connection.connect(function(err) {
    if (err) throw err;
    console.log("database Connected successfully!");
})

module.exports = connection;
