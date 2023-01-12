const { Pool } = require('pg')
const uuid = require("node-uuid");

var connection = new Pool({
    host: "localhost",
    user:"postgres",
    password:"postgres",
    database: "hirise_sales1",
    charset: 'utf8mb4'
});

connection.connect()

console.log("running seed");

let modules = [
    {
        moduleName : 'users',
        moduleType : 'company users'
    },
    {
        moduleName : 'Role',
        moduleType : 'Roles Module'
    },
    {
        moduleName : 'Sales management',
        moduleType : 'Sales Module'
    },
    {
        moduleName : 'Reports',
        moduleType : 'Reports Module'
    },
    {
        moduleName : 'Dashboard',
        moduleType : 'Dashboard Module'
    },
    {
        moduleName : 'Slab Configuration',
        moduleType : 'Slabs Module'
    },
    {
        moduleName : 'Customer management',
        moduleType : 'Customers Module'
    },
    {
        moduleName : 'Commission',
        moduleType : 'Commission Module'
    },
    {
        moduleName : 'Products',
        moduleType : 'products'
    },
    {
        moduleName : 'Forecast Management',
        moduleType : 'Forecast' 
    },
    {
        moduleName : 'Marketing Strategy',
        moduleType : 'Marketing'
    }
]

for(let data of modules){
    let id = uuid.v4()
    connection.query(`insert into modules (id,module_name,module_type ) 
                      values('${id}','${data.moduleName}','${data.moduleType}')`, 
    err => {
        if(err){
            throw err
        }  
    })
}

console.log("seed complete");
connection.end()
