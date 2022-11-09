const { Pool } = require('pg')
const uuid = require("node-uuid");

var connection = new Pool({
    host: "localhost",
    user:"postgres",
    password:"root",
    database: "hirise_sales1",
    charset: 'utf8mb4'
});

connection.connect()
let id = uuid.v4()
console.log("running seed");

connection.query(`insert into modules (id,module_name,module_type ) values('${id}','Sales management','Sales Module')`, err => {
    if(err){
        throw err
    }
    console.log("seed complete");
    connection.end()
})