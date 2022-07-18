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

connection.query(`insert into super_admin (id,name,email,encrypted_password) values('${id}','superadmin', 'superadmin@hirise.com', '4ff3e8922e53309578d694c2dafb41d744af5c4004716f178552449149cd502e9c7022d18cdef4bbe796652d0862f019653e96796ad5d05bffb0f44baaa33528')`, err => {
    if(err){
        throw err
    }
    console.log("seed complete");
    connection.end()
})
