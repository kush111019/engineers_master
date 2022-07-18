const superAdmin = require('./superAdmin.controller')
const users = require('./user.controller')
const companyAdmin = require('./companyAdmin.conroller')

const controller = { 
    superAdmin,
    users,
    companyAdmin
}

module.exports = controller