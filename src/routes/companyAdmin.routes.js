const express = require('express')
var router = express.Router()
var controller = require('../controllers/index')
const { verifyTokenFn } = require('../utils/jwt')
const {
    uploadAvatar , 
    uploadProductImage, 
    uploadProductFile, 
    uploadMailAttechments, 
    uploadLogo, 
    uploadSalesContract,
    uploadSalesInvoice
 } = require('../utils/uploadfiles')

router.post('/upload',verifyTokenFn, uploadAvatar.single('image'),controller.companyAdmin.upload);
router.get('/showProfile',verifyTokenFn, controller.companyAdmin.showProfile)
router.put('/updateProfile',verifyTokenFn, controller.companyAdmin.updateUserProfile)
router.put('/changePassword',verifyTokenFn, controller.companyAdmin.changePassword)
router.put('/updateCompanyLogo', verifyTokenFn,uploadLogo.single('file'), controller.companyAdmin.updateCompanyLogo)

//-------------------------------------Users-------------------------------------------------
router.post('/addUser' , verifyTokenFn, controller.users.addUser)
router.get('/usersList',verifyTokenFn, controller.users.usersList)
router.get('/usersDetails',verifyTokenFn, controller.users.usersDetails)
router.get('/showUserById' , verifyTokenFn, controller.users.showUserById)
router.put('/updateUser' , verifyTokenFn, controller.users.updateUser)
router.put('/deleteUser' , verifyTokenFn, controller.users.deleteUser)
router.put('/lockUserAccount' , verifyTokenFn, controller.users.lockUserAccount)
router.put('/resendVerificationLink', verifyTokenFn, controller.users.resendVerificationLink)

//---------------------------------------modules------------------------------------------

router.get('/moduleList',verifyTokenFn, controller.roles.moduleList)

//-------------------------------------Roles-------------------------------------------------
router.get('/rolesList',verifyTokenFn, controller.roles.rolesList)
router.post('/createRole',verifyTokenFn, controller.roles.createRole)
router.put('/updateRole' , verifyTokenFn, controller.roles.updateRole)
router.put('/deleteRole' , verifyTokenFn, controller.roles.deleteRole)
router.put('/moveRole', verifyTokenFn, controller.roles.moveRole)

//-------------------------------------Slabs-------------------------------------------------
router.get('/slabList',verifyTokenFn, controller.slabs.slabList)
router.post('/createSlab',verifyTokenFn, controller.slabs.createSlab)
router.put('/updateSlab',verifyTokenFn, controller.slabs.updateSlab)
router.put('/deleteSlab',verifyTokenFn, controller.slabs.deleteSlab)
router.put('/deleteSlabLayer',verifyTokenFn, controller.slabs.deleteSlabLayer)


//--------------------------------------followUpNotes--------------------------------------------

router.post('/addfollowUpNotes' , verifyTokenFn, controller.sales.addfollowUpNotes)
router.get('/notesList',verifyTokenFn, controller.sales.notesList)
router.put('/deleteNotes',verifyTokenFn, controller.sales.deleteNote)


//------------------------------------customers---------------------------------------

router.post('/createCustomer',verifyTokenFn, controller.customers.createCustomer)
router.get('/customerList',verifyTokenFn, controller.customers.customerList)
router.put('/editCustomer',verifyTokenFn, controller.customers.editCustomer)
router.put('/deleteContactForCustomer',verifyTokenFn, controller.customers.deleteContactForCustomer)

router.get('/customerCompanyList',verifyTokenFn, controller.customers.customerCompanyList)
router.get('/customerContactDetails',verifyTokenFn, controller.customers.customerContactDetails)
router.put('/deleteCustomer',verifyTokenFn, controller.customers.deleteCustomer)

//------------------------------------Commisions-----------------------------------------
router.post('/commissionSplit',verifyTokenFn, controller.commissions.commissionSplit)
router.put('/updatecommissionSplit',verifyTokenFn, controller.commissions.updatecommissionSplit)
router.get('/commissionSplitList',verifyTokenFn, controller.commissions.commissionSplitList)
router.put('/deletecommissionSplit',verifyTokenFn, controller.commissions.deletecommissionSplit)

//-------------------------------------Products---------------------------------------------

router.post('/addProduct',verifyTokenFn, controller.products.addProduct)
router.put('/updateProduct',verifyTokenFn, controller.products.updateProduct)
router.get('/productList',verifyTokenFn, controller.products.productList)
router.put('/deleteProduct',verifyTokenFn, controller.products.deleteProduct)
router.post('/uploadProductImage',verifyTokenFn, uploadProductImage.single('image'),controller.products.uploadProductImage);
router.post('/uploadProductFile',verifyTokenFn,uploadProductFile.single('file'), controller.products.uploadProductFile)
//----------------------------------------sales conversion --------------------------------
router.get('/customerListforSales',verifyTokenFn, controller.sales.customerListforSales)
router.get('/customerContactDetailsForSales',verifyTokenFn, controller.sales.customerContactDetailsForSales)

router.post('/createSalesCommission',verifyTokenFn, controller.sales.createSalesCommission)

router.get('/allSalesCommissionList',verifyTokenFn, controller.sales.allSalesCommissionList)
router.get('/activeSalesCommissionList',verifyTokenFn, controller.sales.activeSalesCommissionList)
router.get('/closedSalesCommissionList',verifyTokenFn, controller.sales.closedSalesCommissionList)
router.get('/salesDetails',verifyTokenFn, controller.sales.salesDetails)

router.put('/updateSalesCommission',verifyTokenFn, controller.sales.updateSalesCommission)
router.put('/deleteSalesCommission',verifyTokenFn, controller.sales.deleteSalesCommission)
router.get('/salesCommissionLogsList',verifyTokenFn, controller.sales.salesCommissionLogsList)
router.post('/uploadSalesContract', verifyTokenFn,uploadSalesContract.single('file'), controller.sales.uploadSalesContract )
router.post('/closeSales',verifyTokenFn, controller.sales.closeSales)
router.get('/usersListForSales', verifyTokenFn, controller.sales.usersListForSales)
router.get('/commissionSplitListForSales', verifyTokenFn, controller.sales.commissionSplitListForSales)
router.put('/transferBackSales', verifyTokenFn, controller.sales.transferBackSales)
router.get('/transferBackList', verifyTokenFn, controller.sales.transferBackList)
router.post('/uploadSalesInvoice', verifyTokenFn,uploadSalesInvoice.single('file'), controller.sales.uploadSalesInvoice)
router.post('/addRecognizedRevenue', verifyTokenFn, controller.sales.addRecognizedRevenue)
router.get('/recognizedRevenueList', verifyTokenFn, controller.sales.recognizedRevenueList)
router.get('/getRemainingTargetAmount', verifyTokenFn, controller.sales.getRemainingTargetAmount)

//----------------------------------------Reports------------------------------------------
router.get('/revenuePerCustomer',verifyTokenFn, controller.reports.revenuePerCustomer)
router.get('/revenuePerProduct',verifyTokenFn, controller.reports.revenuePerProduct)
router.get('/revenuePerSalesRep',verifyTokenFn, controller.reports.revenuePerSalesRep)
// router.get('/roleWiseRevenue',verifyTokenFn, controller.reports.roleWiseRevenue)
router.get('/totalRevenue',verifyTokenFn, controller.reports.totalRevenue)
//---------------------------------------DashBoard counts -------------------------------

router.get('/revenues',verifyTokenFn, controller.dashboard.revenues)
router.get('/totalExpectedRevenueCounts', verifyTokenFn, controller.dashboard.totalExpectedRevenueCounts)


//-------------------------------------Revenue Forecast----------------------------------

router.post('/createRevenueForecast',verifyTokenFn, controller.revenueForecast.createRevenueForecast)
router.get('/revenueForecastList',verifyTokenFn, controller.revenueForecast.revenueForecastList)
router.get('/forecastDetails',verifyTokenFn, controller.revenueForecast.forecastDetails)
router.put('/auditForecast', verifyTokenFn, controller.revenueForecast.auditForecast)
// router.get('/activeForecastList',verifyTokenFn, controller.revenueForecast.activeForecastList)
// router.get('/closedForecastList',verifyTokenFn, controller.revenueForecast.closedForecastList)
router.get('/actualVsForecast',verifyTokenFn, controller.revenueForecast.actualVsForecast)
// router.put('/closeRevenueForecast', verifyTokenFn, controller.revenueForecast.closeRevenueForecast)
router.put('/editRevenueForecast', verifyTokenFn, controller.revenueForecast.editRevenueForecast)
router.put('/deleteRevenueForecast', verifyTokenFn, controller.revenueForecast.deleteRevenueForecast)
router.put('/deleteAssignedUserForecast', verifyTokenFn, controller.revenueForecast.deleteAssignedUserForecast)


//---------------------------------------Business and Revenue Contact-------------------------

router.post('/addBusinessContact',verifyTokenFn, controller.customers.addBusinessContact)
router.post('/addRevenueContact',verifyTokenFn, controller.customers.addRevenueContact)

//-------------------------------------------Configurations----------------------------------
router.post('/addConfigs', verifyTokenFn, controller.configuration.addConfigs)
router.get('/configList', verifyTokenFn, controller.configuration.configList)
router.post('/addImapCredentials', verifyTokenFn, controller.configuration.addImapCredentials)
router.get('/imapCredentialsList', verifyTokenFn, controller.configuration.imapCredentials)

//------------------------------------Payment----------------------------------------
router.post('/createPayment', controller.payment.createPayment)
router.get('/userCount', verifyTokenFn, controller.users.userCount)
router.get('/subscriptionDetails', verifyTokenFn, controller.payment.subscriptionDetails)
router.put('/cancelSubscription', verifyTokenFn, controller.payment.cancelSubscription)
router.post('/upgradeSubscription', verifyTokenFn, controller.payment.upgradeSubscription)


//-----------------------------------Chat----------------------------------------------
router.post("/accessChat",verifyTokenFn, controller.chat.accessChat);
router.get("/fetchChats", verifyTokenFn, controller.chat.fetchChats);
router.post("/createGroupChat",verifyTokenFn, controller.chat.createGroupChat);

router.get("/allMessages/:chatId", verifyTokenFn, controller.chat.allMessages);
router.post("/sendMessage",verifyTokenFn, controller.chat.sendMessage);

//-----------------------------Emails to business and revenue contacts------------------------
router.post('/uploadAttechment', verifyTokenFn, uploadMailAttechments.array('attachments', 10), controller.email.uploadMailAttechment )
router.post('/sendEmailToContact', verifyTokenFn, controller.email.sendEmail)
router.get('/fetchEmails', verifyTokenFn, controller.email.fetchEmails)
router.get('/inbox', verifyTokenFn, controller.email.inbox)
router.post('/readEmail', verifyTokenFn, controller.email.readEmail)
router.get('/SentEmailList/:salesId', verifyTokenFn, controller.email.SentEmailList)

//-------------------------------Leads-----------------------------------------
router.get('/organizationList',verifyTokenFn, controller.leads.organizationList)
router.post('/createLead',verifyTokenFn, controller.leads.createLead)
router.get('/leadsList',verifyTokenFn, controller.leads.leadsList)
router.put('/updateLead',verifyTokenFn, controller.leads.updateLead)
router.put('/deleteLead',verifyTokenFn, controller.leads.deleteLead)
router.put('/rejectLead',verifyTokenFn, controller.leads.rejectLead)
router.get('/totalVsRejectedLeads', verifyTokenFn, controller.leads.rejectedLeads )
router.post('/convertLeadToCustomer',verifyTokenFn, controller.leads.convertLeadToCustomer)

//-------------------------------Marketing strategy-----------------------------------------
router.get('/marketingDashboard',verifyTokenFn, controller.marketingStrategy.marketingDashboard)

router.post('/addBudget', verifyTokenFn, controller.marketingStrategy.addBudget)
router.get('/budgetList', verifyTokenFn, controller.marketingStrategy.budgetList)
router.put('/deleteBudget', verifyTokenFn, controller.marketingStrategy.deleteBudget)
router.put('/updateBudget', verifyTokenFn, controller.marketingStrategy.updateBudget)
router.get('/budgetLogList', verifyTokenFn, controller.marketingStrategy.budgetLogList)
router.put('/deleteDescription', verifyTokenFn, controller.marketingStrategy.deleteDescription)
router.put('/finalizeBudget', verifyTokenFn, controller.marketingStrategy.finalizeBudget)


//-----------------------------------Lead Title--------------------------------------------
router.post('/addLeadTitle',verifyTokenFn, controller.configuration.addLeadTitle)
router.get('/leadTitleList',verifyTokenFn, controller.configuration.leadTitleList)
router.put('/updateLeadTitle',verifyTokenFn, controller.configuration.updateLeadTitle)
router.put('/deleteLeadTitle',verifyTokenFn, controller.configuration.deleteLeadTitle)

router.post('/addLeadIndustry',verifyTokenFn, controller.configuration.addLeadIndustry)
router.get('/leadIndustryList',verifyTokenFn, controller.configuration.leadIndustryList)
router.put('/updateLeadIndustry',verifyTokenFn, controller.configuration.updateLeadIndustry)
router.put('/deleteLeadIndustry',verifyTokenFn, controller.configuration.deleteLeadIndustry)

router.post('/addLeadSource',verifyTokenFn, controller.configuration.addLeadSource)
router.get('/leadSourceList',verifyTokenFn, controller.configuration.leadSourceList)
router.put('/updateLeadSource',verifyTokenFn, controller.configuration.updateLeadSource)
router.put('/deleteLeadSource',verifyTokenFn, controller.configuration.deleteLeadSource)



//----------------------------------------Notifications------------------------------------
router.get('/notificationList',verifyTokenFn, controller.notifications.notificationList)
router.put('/notificationRead',verifyTokenFn, controller.notifications.notificationRead)






module.exports = router;