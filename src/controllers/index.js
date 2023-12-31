const superAdmin = require('./superAdmin.controller')
const users = require('./user.controller')
const companyAdmin = require('./companyAdmin.controller')
const roles = require('./roles.controller')
const slabs = require('./slabs.controller')
const customers = require('./customers.controller')
const commissions = require('./commissions.controller')
const products = require('./products.controller')
const sales = require('./sales.controller')
const salesApproval = require('./salesApproval.controller')
const reports = require('./reports.controller')
const revenueForecast = require('./revenueForcast.controller')
const configuration = require('./configurations.controllers')
const contactUs = require('./contactUs.controller')
const dashboard = require('./dashboard.controller')
const payment = require('./payment.controller')
const chat = require('./chat.controller')
const email = require('./email.controller')
const leads = require('./leadsController')
const marketingStrategy = require('./merketingStrategy.controller')
const notifications = require('./notifications.controller')
const proUser = require('./proUsers.controller')
const cron = require('./cron.controller')


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
    salesApproval,
    reports,
    revenueForecast,
    configuration,
    contactUs,
    dashboard,
    payment,
    chat,
    email,
    leads,
    marketingStrategy,
    notifications,
    proUser,
    cron
}

module.exports = controller