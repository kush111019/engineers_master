const { Pool } = require('pg')
const uuid = require("node-uuid");
const { sha3_512 } = require('js-sha3')

var connection = new Pool({
    host: "localhost",
    user:"postgres",
    password:"root",
    database: "hirise_sales1",
    charset: 'utf8mb4'
});

connection.connect()
let id = uuid.v4()
let encryptedPassword = sha3_512('Admin@123#')
console.log("running seed");

connection.query(`insert into super_admin (id,name,email,encrypted_password) values('${id}','superadmin', 'superadmin@hirise.com', '${encryptedPassword}')`, err => {
    if(err){
        throw err
    }
    console.log("seed complete");
    connection.end()
})
