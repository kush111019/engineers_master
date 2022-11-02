const superAdmin = require('./superAdmin.controller')
const users = require('./user.controller')
const companyAdmin = require('./companyAdmin.conroller')
const roles = require('./roles.controller')
const slabs = require('./slabs.controller')
const customers = require('./customers.controller')
const commissions = require('./commissions.controller')
const products = require('./products.controller')
const sales = require('./sales.controller')
const reports = require('./reports.controller')
const revenueForecast = require('./revenueForcast.controller')
const configuration = require('./configurations.controllers')
const contactUs = require('./contactUs.controller')
const dashboard = require('./dashboard.controller')
const payment = require('./payment.controller')
const chat = require('./chat.controller')
const email = require('./email.controller')

const controller = { 
    superAdmin,
    users,
    companyAdmin,
    roles,
    slabs,
    customers,
    commissions,
    products,
    sales,
    reports,
    revenueForecast,
    configuration,
    contactUs,
    dashboard,
    payment,
    chat,
    email
}

module.exports = controller