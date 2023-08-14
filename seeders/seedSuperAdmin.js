const { Pool } = require('pg')
const uuid = require("node-uuid");
const { sha3_512 } = require('js-sha3')
require('dotenv').config();

var Sconnection = new Pool({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    charset: 'utf8mb4'
});
Sconnection.connect()
let id = uuid.v4()
let email = process.env.SUPER_ADMIN_EMAIL
let encryptedPassword = sha3_512(process.env.SUPER_ADMIN_PASS)

console.log("running seed");

Sconnection.query(`insert into super_admin (id,name,email,encrypted_password) values('${id}','superadmin', '${email}', '${encryptedPassword}')`, err => {
    if(err){
        throw err
    }
    console.log("seed complete");
    Sconnection.end()
})
