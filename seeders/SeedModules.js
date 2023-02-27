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
        moduleName : 'Dashboard',
        moduleType : 'Dashboard Module', 
        module_ctr : 1
    },
    {
        moduleName : 'Role',
        moduleType : 'Roles Module',
        module_ctr : 2
    },
    {
        moduleName : 'users',
        moduleType : 'company users',
        module_ctr : 3
    },
    {
        moduleName : 'Reports',
        moduleType : 'Reports Module',
        module_ctr : 4
    },
    {
        moduleName : 'Marketing Strategy',
        moduleType : 'Marketing',
        module_ctr : 5
    },
    {
        moduleName : 'Sales',
        moduleType : 'Sales Module',
        module_ctr : 6
    },
    {
        moduleName : 'Customers',
        moduleType : 'Customers Module',
        module_ctr : 7
    },
    {
        moduleName : 'Leads',
        moduleType : 'Leads',
        module_ctr : 8
    },
    {
        moduleName : 'Slab Configuration',
        moduleType : 'Slabs Module', 
        module_ctr : 9
    },
    
    {
        moduleName : 'Commission',
        moduleType : 'Commission Module',
        module_ctr : 10
    },
    {
        moduleName : 'Products',
        moduleType : 'products',
        module_ctr : 11
    },
    {
        moduleName : 'Forecast',
        moduleType : 'Forecast',
        module_ctr :  12
    }
]

for(let data of modules){
    let id = uuid.v4()
    connection.query(`insert into modules (id,module_name,module_type,module_ctr ) 
                      values('${id}','${data.moduleName}','${data.moduleType}','${module_ctr}')`, 
    err => {
        if(err){
            throw err
        }  
    })
}

console.log("seed complete");
connection.end()
