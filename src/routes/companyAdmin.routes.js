const express = require('express')
var router = express.Router()
var controller = require('../controllers/index')
const { verifyTokenFn } = require('../utils/jwt')
const {
    uploadAvatar,
    uploadProductImage,
    uploadProductFile,
    uploadMailAttechments,
    uploadLogo,
    uploadSalesContract,
    uploadSalesInvoice,
    uploadLeadsFile
} = require('../utils/uploadfiles')

router.post('/upload', verifyTokenFn, uploadAvatar.single('image'), controller.companyAdmin.upload);
router.get('/showProfile', verifyTokenFn, controller.companyAdmin.showProfile)
router.put('/updateProfile', verifyTokenFn, controller.companyAdmin.updateUserProfile)
router.put('/changePassword', verifyTokenFn, controller.companyAdmin.changePassword)
router.put('/updateCompanyLogo', verifyTokenFn, uploadLogo.single('file'), controller.companyAdmin.updateCompanyLogo)

//-------------------------------------Users-------------------------------------------------
router.get('/userCount', verifyTokenFn, controller.users.userCount)
router.get('/proUserCount', verifyTokenFn, controller.users.proUserCount)
router.post('/addUser', verifyTokenFn, controller.users.addUser)
router.get('/usersList', verifyTokenFn, controller.users.usersList)
router.get('/usersDetails', verifyTokenFn, controller.users.usersDetails)
router.get('/showUserById', verifyTokenFn, controller.users.showUserById)
router.put('/updateUser', verifyTokenFn, controller.users.updateUser)
router.put('/deleteUser', verifyTokenFn, controller.users.deleteUser)
router.put('/lockUserAccount', verifyTokenFn, controller.users.lockUserAccount)
router.put('/deactivateUserAccount', verifyTokenFn, controller.users.deactivateUserAccount)
router.put('/AssigneSaleOrLeadToNewUser', verifyTokenFn, controller.users.AssigneSaleOrLeadToNewUser)

//---------------------------------------modules------------------------------------------

router.get('/moduleList', verifyTokenFn, controller.roles.moduleList)

//-------------------------------------Roles-------------------------------------------------
router.get('/rolesList', verifyTokenFn, controller.roles.rolesList)
router.post('/createRole', verifyTokenFn, controller.roles.createRole)
router.put('/updateRole', verifyTokenFn, controller.roles.updateRole)
router.put('/deleteRole', verifyTokenFn, controller.roles.deleteRole)
router.put('/moveRole', verifyTokenFn, controller.roles.moveRole)

//-------------------------------------Slabs-------------------------------------------------
router.get('/slabList', verifyTokenFn, controller.slabs.slabList)
router.post('/createSlab', verifyTokenFn, controller.slabs.createSlab)
router.put('/updateSlab', verifyTokenFn, controller.slabs.updateSlab)
router.put('/deleteSlab', verifyTokenFn, controller.slabs.deleteSlab)
router.put('/deleteSlabLayer', verifyTokenFn, controller.slabs.deleteSlabLayer)


//--------------------------------------followUpNotes--------------------------------------------

router.post('/addfollowUpNotes', verifyTokenFn, controller.sales.addfollowUpNotes)
router.get('/notesList', verifyTokenFn, controller.sales.notesList)
router.put('/deleteNotes', verifyTokenFn, controller.sales.deleteNote)


//------------------------------------customers---------------------------------------

router.post('/createCustomer', verifyTokenFn, controller.customers.createCustomer)
router.post('/createCustomerWithLead', verifyTokenFn, controller.customers.createCustomerWithLead)
router.get('/customerList', verifyTokenFn, controller.customers.customerList)
router.put('/editCustomer', verifyTokenFn, controller.customers.editCustomer)
router.put('/deleteContactForCustomer', verifyTokenFn, controller.customers.deleteContactForCustomer)
router.put('/deleteCustomer', verifyTokenFn, controller.customers.deleteCustomer)
router.put('/archiveUnarchiveCustomer', verifyTokenFn, controller.customers.archiveUnarchiveCustomer)

//------------------------------------Commisions-----------------------------------------
router.post('/commissionSplit', verifyTokenFn, controller.commissions.commissionSplit)
router.put('/updatecommissionSplit', verifyTokenFn, controller.commissions.updatecommissionSplit)
router.get('/commissionSplitList', verifyTokenFn, controller.commissions.commissionSplitList)
router.put('/deletecommissionSplit', verifyTokenFn, controller.commissions.deletecommissionSplit)

//-------------------------------------Products---------------------------------------------

router.post('/addProduct', verifyTokenFn, controller.products.addProduct)
router.put('/updateProduct', verifyTokenFn, controller.products.updateProduct)
router.get('/productList', verifyTokenFn, controller.products.productList)
router.put('/deleteProduct', verifyTokenFn, controller.products.deleteProduct)
router.post('/uploadProductImage', verifyTokenFn, uploadProductImage.single('image'), controller.products.uploadProductImage);
router.post('/uploadProductFile', verifyTokenFn, uploadProductFile.single('file'), controller.products.uploadProductFile)

//----------------------------------------sales --------------------------------
router.get('/customerListforSales', verifyTokenFn, controller.sales.customerListforSales)

router.post('/createSales', verifyTokenFn, controller.sales.createSales)

router.get('/allSalesList', verifyTokenFn, controller.sales.allSalesList)
// router.get('/activeSalesList',verifyTokenFn, controller.sales.activeSalesList)
// router.get('/closedSalesList',verifyTokenFn, controller.sales.closedSalesList)
//router.get('/archivedSalesList',verifyTokenFn, controller.sales.archivedSalesList)
router.get('/salesDetails', verifyTokenFn, controller.sales.salesDetails)

router.put('/updateSales', verifyTokenFn, controller.sales.updateSales)
router.put('/deleteSales', verifyTokenFn, controller.sales.deleteSales)
router.put('/archivedSales', verifyTokenFn, controller.sales.archivedSales)

router.get('/salesLogsList', verifyTokenFn, controller.sales.salesLogsList)
router.post('/uploadSalesContract', verifyTokenFn, uploadSalesContract.single('file'), controller.sales.uploadSalesContract)
router.post('/closeSales', verifyTokenFn, controller.sales.closeSales)
router.get('/usersListForSales', verifyTokenFn, controller.sales.usersListForSales)
router.get('/commissionSplitListForSales', verifyTokenFn, controller.sales.commissionSplitListForSales)
router.put('/transferBackSales', verifyTokenFn, controller.sales.transferBackSales)
router.get('/transferBackList', verifyTokenFn, controller.sales.transferBackList)
router.post('/uploadSalesInvoice', verifyTokenFn, uploadSalesInvoice.single('file'), controller.sales.uploadSalesInvoice)
router.post('/addRecognizedRevenue', verifyTokenFn, controller.sales.addRecognizedRevenue)
router.get('/recognizedRevenueList', verifyTokenFn, controller.sales.recognizedRevenueList)
router.get('/getRemainingTargetAmount', verifyTokenFn, controller.sales.getRemainingTargetAmount)
router.get('/getAllApiDeatilsRelatedSales', verifyTokenFn, controller.sales.getAllApiDeatilsRelatedSales)
router.get('/userCommissionList', verifyTokenFn, controller.sales.userCommissionList)
router.get('/salesWiseCommissionList', verifyTokenFn, controller.sales.salesWiseCommissionList)
router.put('/updateUserCommission', verifyTokenFn, controller.sales.updateUserCommission)
router.get('/commissionDetails', verifyTokenFn, controller.sales.commissionDetails)


//----------------------------------------Sales Approval --------------------------------
router.get('/getUpperLevelUserList', verifyTokenFn, controller.salesApproval.getUpperLevelUserList)
router.post('/sendApprovalRequestForSales', verifyTokenFn, controller.salesApproval.sendApprovalRequestForSales)
router.put('/acceptOrRejectApproveRequestForSales', verifyTokenFn, controller.salesApproval.acceptOrRejectApproveRequestForSales)
router.get('/approveRequestDetails', verifyTokenFn, controller.salesApproval.approveRequestDetails)
router.get('/allApproveRequestList', verifyTokenFn, controller.salesApproval.allApproveRequestList)


//----------------------------------------Reports------------------------------------------
router.get('/revenuePerCustomer', verifyTokenFn, controller.reports.revenuePerCustomer)
router.get('/revenuePerProduct', verifyTokenFn, controller.reports.revenuePerProduct)
router.get('/revenuePerSalesRep', verifyTokenFn, controller.reports.revenuePerSalesRep)
router.get('/totalRevenue', verifyTokenFn, controller.reports.totalRevenue)
router.get('/totalLossRevenue', verifyTokenFn, controller.reports.totalLossRevenue)
//---------------------------------------DashBoard counts -------------------------------

router.get('/revenues', verifyTokenFn, controller.dashboard.revenues)
// router.get('/totalExpectedRevenueCounts', verifyTokenFn, controller.dashboard.totalExpectedRevenueCounts)
router.get('/dataCreationStatus', verifyTokenFn, controller.dashboard.dataCreationStatus)


//-------------------------------------Revenue Forecast----------------------------------

router.post('/createRevenueForecast', verifyTokenFn, controller.revenueForecast.createRevenueForecast)
router.get('/revenueForecastList', verifyTokenFn, controller.revenueForecast.revenueForecastList)
router.get('/forecastDetails', verifyTokenFn, controller.revenueForecast.forecastDetails)
router.put('/auditForecast', verifyTokenFn, controller.revenueForecast.auditForecast)
router.put('/acceptForecast', verifyTokenFn, controller.revenueForecast.acceptForecast)
router.get('/actualVsForecast', verifyTokenFn, controller.revenueForecast.actualVsForecast)
router.put('/editRevenueForecast', verifyTokenFn, controller.revenueForecast.editRevenueForecast)
router.put('/updateAssignedUsersForecast', verifyTokenFn, controller.revenueForecast.updateAssignedUsersForecast)
router.put('/deleteRevenueForecast', verifyTokenFn, controller.revenueForecast.deleteRevenueForecast)
router.put('/deleteAssignedUserForecast', verifyTokenFn, controller.revenueForecast.deleteAssignedUserForecast)

//---------------------------------------Business and Revenue Contact-------------------------

router.post('/addBusinessAndRevenueContact', verifyTokenFn, controller.customers.addBusinessAndRevenueContact)

//-------------------------------------------Configurations----------------------------------
router.post('/addConfigs', verifyTokenFn, controller.configuration.addConfigs)
router.get('/configList', verifyTokenFn, controller.configuration.configList)
router.post('/addImapCredentials', verifyTokenFn, controller.configuration.addImapCredentials)
router.get('/imapCredentialsList', verifyTokenFn, controller.configuration.imapCredentials)

//------------------------------------Payment----------------------------------------
router.post('/createPayment', controller.payment.createPayment)
router.get('/subscriptionDetails', verifyTokenFn, controller.payment.subscriptionDetails)
router.put('/cancelSubscription', verifyTokenFn, controller.payment.cancelSubscription)
router.post('/upgradeSubscription', verifyTokenFn, controller.payment.upgradeSubscription)


//-----------------------------------Chat----------------------------------------------
router.post("/accessChat", verifyTokenFn, controller.chat.accessChat);
router.get("/fetchChats", verifyTokenFn, controller.chat.fetchChats);
router.post("/createGroupChat", verifyTokenFn, controller.chat.createGroupChat);

router.get("/allMessages/:chatId", verifyTokenFn, controller.chat.allMessages);
router.post("/sendMessage", verifyTokenFn, controller.chat.sendMessage);

//-----------------------------Emails to business and revenue contacts------------------------
router.post('/uploadAttechment', verifyTokenFn, uploadMailAttechments.array('attachments', 10), controller.email.uploadMailAttechment)
router.post('/sendEmailToContact', verifyTokenFn, controller.email.sendEmail)
router.get('/fetchEmails', verifyTokenFn, controller.email.fetchEmails)
router.get('/inbox', verifyTokenFn, controller.email.inbox)
router.post('/readEmail', verifyTokenFn, controller.email.readEmail)
router.get('/SentEmailList/:salesId', verifyTokenFn, controller.email.SentEmailList)

//-------------------------------Leads-----------------------------------------
router.post('/createLead', verifyTokenFn, controller.leads.createLead)
router.get('/leadsList', verifyTokenFn, controller.leads.leadsList)
router.get('/leadsDetails', verifyTokenFn, controller.leads.leadsDetails)
router.put('/updateLead', verifyTokenFn, controller.leads.updateLead)
router.put('/deleteLead', verifyTokenFn, controller.leads.deleteLead)
router.put('/rejectLead', verifyTokenFn, controller.leads.rejectLead)
router.post('/uploadLeadsFile', verifyTokenFn, uploadLeadsFile.single('file'), controller.leads.uploadLeadFile)

//-------------------------------Marketing strategy-----------------------------------------
router.get('/marketingDashboard', verifyTokenFn, controller.marketingStrategy.marketingDashboard)

router.post('/addBudget', verifyTokenFn, controller.marketingStrategy.addBudget)
router.get('/budgetList', verifyTokenFn, controller.marketingStrategy.budgetList)
router.get('/budgetDetails', verifyTokenFn, controller.marketingStrategy.budgetDetails)
router.put('/deleteBudget', verifyTokenFn, controller.marketingStrategy.deleteBudget)
router.put('/updateBudget', verifyTokenFn, controller.marketingStrategy.updateBudget)
router.get('/budgetLogList', verifyTokenFn, controller.marketingStrategy.budgetLogList)
router.put('/deleteDescription', verifyTokenFn, controller.marketingStrategy.deleteDescription)
router.put('/finalizeBudget', verifyTokenFn, controller.marketingStrategy.finalizeBudget)


//-----------------------------------Lead Title--------------------------------------------
router.post('/addLeadTitle', verifyTokenFn, controller.configuration.addLeadTitle)
router.get('/leadTitleList', verifyTokenFn, controller.configuration.leadTitleList)
router.put('/updateLeadTitle', verifyTokenFn, controller.configuration.updateLeadTitle)
router.put('/deleteLeadTitle', verifyTokenFn, controller.configuration.deleteLeadTitle)

router.post('/addLeadIndustry', verifyTokenFn, controller.configuration.addLeadIndustry)
router.get('/leadIndustryList', verifyTokenFn, controller.configuration.leadIndustryList)
router.put('/updateLeadIndustry', verifyTokenFn, controller.configuration.updateLeadIndustry)
router.put('/deleteLeadIndustry', verifyTokenFn, controller.configuration.deleteLeadIndustry)

router.post('/addLeadSource', verifyTokenFn, controller.configuration.addLeadSource)
router.get('/leadSourceList', verifyTokenFn, controller.configuration.leadSourceList)
router.put('/updateLeadSource', verifyTokenFn, controller.configuration.updateLeadSource)
router.put('/deleteLeadSource', verifyTokenFn, controller.configuration.deleteLeadSource)



//----------------------------------------Notifications------------------------------------
router.get('/notificationList', verifyTokenFn, controller.notifications.notificationList)
router.get('/notifications', verifyTokenFn, controller.notifications.allNotificationList)
router.put('/notificationRead', verifyTokenFn, controller.notifications.notificationRead)


//-----------------------------------------Connectors------------------------------
router.get('/connectorList',verifyTokenFn,controller.proUser.connectorsList)
router.get('/auth/authUrl',controller.proUser.authUrl);
router.post('/auth/callback',verifyTokenFn,controller.proUser.callback)
router.get('/leadReSync',verifyTokenFn,controller.proUser.leadReSync)
router.get('/proLeadsList',verifyTokenFn,controller.proUser.proLeadsList)
router.get('/salesListForPro',verifyTokenFn,controller.proUser.salesListForPro)
router.get('/recognizationDetailsPro',verifyTokenFn,controller.proUser.recognizationDetailsPro)
router.post('/addAvailability',verifyTokenFn,controller.proUser.addAvailability)
router.get('/availabilityList',verifyTokenFn, controller.proUser.availableTimeList)

//pro email 
router.post('/createProEmailTemplate',verifyTokenFn,controller.proUser.createProEmailTemplate)
router.get('/emailTemplateList',verifyTokenFn,controller.proUser.emailTemplateList)
router.put('/updateEmailTemplate',verifyTokenFn,controller.proUser.updateEmailTemplate)
router.put('/deleteEmailTemplate',verifyTokenFn,controller.proUser.deleteEmailTemplate)
router.post('/addSmtpCreds',verifyTokenFn, controller.proUser.addSmtpCreds)
router.get('/credentialList', verifyTokenFn, controller.proUser.credentialList)
router.post('/sendEmailToLead', verifyTokenFn,controller.proUser.sendEmailToLead)

//event and calendar for pro
router.post('/createEvent',verifyTokenFn,controller.proUser.createEvent)
router.get('/eventsList',verifyTokenFn,controller.proUser.eventsList)
router.get('/eventDetails', controller.proUser.eventDetails)
router.post('/scheduleEvent',controller.proUser.scheduleEvent)
router.get('/scheduledEventsList', verifyTokenFn, controller.proUser.scheduledEventsList)
router.get('/availabilityDetails',verifyTokenFn,controller.proUser.availabilityDetails)
router.put('/updateAvailability',verifyTokenFn,controller.proUser.updateAvailability)
router.put('/deleteAvalability',verifyTokenFn,controller.proUser.deleteAvalability)
router.put('/deleteTimeSlot',verifyTokenFn,controller.proUser.deleteTimeSlot)
router.put('/updateEvent',verifyTokenFn,controller.proUser.updateEvent)
router.put('/deleteEvent',verifyTokenFn,controller.proUser.deleteEvent)

module.exports = router;