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
console.log(id,"id");
console.log("running seed");

connection.query(`insert into modules (id,module_name,module_type , company_id) values('${id}','Sales management','Sales Module', 'fbaee8cb-a2ed-4fff-956f-2ec074abc439')`, err => {
    if(err){
        throw err
    }
    console.log("seed complete");
    connection.end()
})