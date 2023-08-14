const { Pool } = require('pg')
const uuid = require("node-uuid");
require('dotenv').config()

var connection = new Pool({
    host: process.env.HOST,
    user:process.env.DATABASE_USER,
    password:process.env.PASSWORD,
    database: process.env.DATABASE,
    charset: 'utf8mb4'
});

connection.connect()

console.log("running seed");
let countryDetails = [
    {
        countryName : 'United States',
        countryValue : 'us',
        currencyName : 'US Dollar',
        currencySymbol : '$',
        dateFormat : 'MM-DD-YYYY'
    },
    {
        countryName : 'India',
        countryValue : 'in',
        currencyName : 'Indian Rupees',
        currencySymbol : '₹',
        dateFormat : 'DD-MM-YYYY'
    },
]
for(let data of countryDetails){
    let id = uuid.v4()
    connection.query(`insert into country_details (id,country_name,country_value,
                      currency_name,currency_symbol,date_format) 
                      values('${id}','${data.countryName}','${data.countryValue}',
                      '${data.currencyName}','${data.currencySymbol}','${data.dateFormat}')`, 
    err => {
        if(err){
            throw err
        }  
    })
}

console.log("seed complete");
connection.end();
process.exit();
