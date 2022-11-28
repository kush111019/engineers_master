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

console.log("running seed");

let moduleName = ['users','Role','Sales management','Reports','Dashboard','Slab Configuration','Customer management','Commission','Products','Forecast Management'];

let moduleType = ['company users','Roles Module','Sales Module','Reports  Module','Dashboard Module','Slabs Module','Customers Module','Commission Module','products','Forecast']

for(let i = 0; i<= moduleName.length; i++){
    let id = uuid.v4()
    connection.query(`insert into modules (id,module_name,module_type ) values('${id}','${moduleName[i]}','${moduleType[i]}')`, err => {
        if(err){
            throw err
        }  
    })
}

console.log("seed complete");
connection.end()
