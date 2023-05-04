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
const {checkParams} = require('../utils/helper')

router.post('/upload', verifyTokenFn,checkParams, uploadAvatar.single('image'), controller.companyAdmin.upload);
router.get('/showProfile', verifyTokenFn,checkParams, controller.companyAdmin.showProfile)
router.put('/updateProfile', verifyTokenFn,checkParams, controller.companyAdmin.updateUserProfile)
router.put('/changePassword', verifyTokenFn,checkParams, controller.companyAdmin.changePassword)
router.put('/updateCompanyLogo', verifyTokenFn,checkParams, uploadLogo.single('file'), controller.companyAdmin.updateCompanyLogo)

//-------------------------------------Users-------------------------------------------------
router.get('/userCount', verifyTokenFn,checkParams, controller.users.userCount)
router.get('/proUserCount', verifyTokenFn,checkParams, controller.users.proUserCount)
router.post('/addUser', verifyTokenFn,checkParams, controller.users.addUser)
router.get('/usersList', verifyTokenFn,checkParams, controller.users.usersList)
router.get('/usersDetails', verifyTokenFn,checkParams, controller.users.usersDetails)
router.get('/showUserById', verifyTokenFn,checkParams, controller.users.showUserById)
router.put('/updateUser', verifyTokenFn,checkParams, controller.users.updateUser)
router.put('/deleteUser', verifyTokenFn,checkParams, controller.users.deleteUser)
router.put('/lockUserAccount', verifyTokenFn,checkParams, controller.users.lockUserAccount)
router.put('/deactivateUserAccount', verifyTokenFn,checkParams, controller.users.deactivateUserAccount)
router.put('/AssigneSaleOrLeadToNewUser', verifyTokenFn,checkParams, controller.users.AssigneSaleOrLeadToNewUser)

//---------------------------------------modules------------------------------------------

router.get('/moduleList', verifyTokenFn,checkParams, controller.roles.moduleList)

//-------------------------------------Roles-------------------------------------------------
router.get('/rolesList', verifyTokenFn,checkParams, controller.roles.rolesList)
router.post('/createRole', verifyTokenFn,checkParams, controller.roles.createRole)
router.put('/updateRole', verifyTokenFn,checkParams, controller.roles.updateRole)
router.put('/deleteRole', verifyTokenFn,checkParams, controller.roles.deleteRole)
router.put('/moveRole', verifyTokenFn,checkParams, controller.roles.moveRole)

//-------------------------------------Slabs-------------------------------------------------
router.get('/slabList', verifyTokenFn,checkParams, controller.slabs.slabList)
router.post('/createSlab', verifyTokenFn,checkParams, controller.slabs.createSlab)
router.put('/updateSlab', verifyTokenFn,checkParams, controller.slabs.updateSlab)
router.put('/deleteSlab', verifyTokenFn,checkParams, controller.slabs.deleteSlab)
router.put('/deleteSlabLayer', verifyTokenFn,checkParams, controller.slabs.deleteSlabLayer)


//--------------------------------------followUpNotes--------------------------------------------

router.post('/addfollowUpNotes', verifyTokenFn,checkParams, controller.sales.addfollowUpNotes)
router.get('/notesList', verifyTokenFn,checkParams, controller.sales.notesList)
router.put('/deleteNotes', verifyTokenFn,checkParams, controller.sales.deleteNote)


//------------------------------------customers---------------------------------------

router.post('/createCustomer', verifyTokenFn,checkParams, controller.customers.createCustomer)
router.post('/createCustomerWithLead', verifyTokenFn,checkParams, controller.customers.createCustomerWithLead)
router.get('/customerList', verifyTokenFn,checkParams, controller.customers.customerList)
router.put('/editCustomer', verifyTokenFn,checkParams, controller.customers.editCustomer)
router.put('/deleteContactForCustomer', verifyTokenFn,checkParams, controller.customers.deleteContactForCustomer)
router.put('/deleteCustomer', verifyTokenFn,checkParams, controller.customers.deleteCustomer)
router.put('/archiveUnarchiveCustomer', verifyTokenFn,checkParams, controller.customers.archiveUnarchiveCustomer)

//------------------------------------Commisions-----------------------------------------
router.post('/commissionSplit', verifyTokenFn,checkParams, controller.commissions.commissionSplit)
router.put('/updatecommissionSplit', verifyTokenFn,checkParams, controller.commissions.updatecommissionSplit)
router.get('/commissionSplitList', verifyTokenFn,checkParams, controller.commissions.commissionSplitList)
router.put('/deletecommissionSplit', verifyTokenFn,checkParams, controller.commissions.deletecommissionSplit)

//-------------------------------------Products---------------------------------------------

router.post('/addProduct', verifyTokenFn,checkParams, controller.products.addProduct)
router.put('/updateProduct', verifyTokenFn,checkParams, controller.products.updateProduct)
router.get('/productList', verifyTokenFn,checkParams, controller.products.productList)
router.put('/deleteProduct', verifyTokenFn,checkParams, controller.products.deleteProduct)
router.post('/uploadProductImage', verifyTokenFn,checkParams, uploadProductImage.single('image'), controller.products.uploadProductImage);
router.post('/uploadProductFile', verifyTokenFn,checkParams, uploadProductFile.single('file'), controller.products.uploadProductFile)

//----------------------------------------sales --------------------------------
router.get('/customerListforSales', verifyTokenFn,checkParams, controller.sales.customerListforSales)

router.post('/createSales', verifyTokenFn,checkParams, controller.sales.createSales)

router.get('/allSalesList', verifyTokenFn,checkParams, controller.sales.allSalesList)
// router.get('/activeSalesList',verifyTokenFn,checkParams, controller.sales.activeSalesList)
// router.get('/closedSalesList',verifyTokenFn,checkParams, controller.sales.closedSalesList)
//router.get('/archivedSalesList',verifyTokenFn,checkParams, controller.sales.archivedSalesList)
router.get('/salesDetails', verifyTokenFn,checkParams, controller.sales.salesDetails)

router.put('/updateSales', verifyTokenFn,checkParams, controller.sales.updateSales)
router.put('/deleteSales', verifyTokenFn,checkParams, controller.sales.deleteSales)
router.put('/archivedSales', verifyTokenFn,checkParams, controller.sales.archivedSales)

router.get('/salesLogsList', verifyTokenFn,checkParams, controller.sales.salesLogsList)
router.post('/uploadSalesContract', verifyTokenFn,checkParams, uploadSalesContract.single('file'), controller.sales.uploadSalesContract)
router.post('/closeSales', verifyTokenFn,checkParams, controller.sales.closeSales)
router.get('/usersListForSales', verifyTokenFn,checkParams, controller.sales.usersListForSales)
router.get('/commissionSplitListForSales', verifyTokenFn,checkParams, controller.sales.commissionSplitListForSales)
router.put('/transferBackSales', verifyTokenFn,checkParams, controller.sales.transferBackSales)
router.get('/transferBackList', verifyTokenFn,checkParams, controller.sales.transferBackList)
router.post('/uploadSalesInvoice', verifyTokenFn,checkParams, uploadSalesInvoice.single('file'), controller.sales.uploadSalesInvoice)
router.post('/addRecognizedRevenue', verifyTokenFn,checkParams, controller.sales.addRecognizedRevenue)
router.get('/recognizedRevenueList', verifyTokenFn,checkParams, controller.sales.recognizedRevenueList)
router.get('/getRemainingTargetAmount', verifyTokenFn,checkParams, controller.sales.getRemainingTargetAmount)
router.get('/getAllApiDeatilsRelatedSales', verifyTokenFn,checkParams, controller.sales.getAllApiDeatilsRelatedSales)
router.get('/userCommissionList', verifyTokenFn,checkParams, controller.sales.userCommissionList)
router.get('/salesWiseCommissionList', verifyTokenFn,checkParams, controller.sales.salesWiseCommissionList)
router.put('/updateUserCommission', verifyTokenFn,checkParams, controller.sales.updateUserCommission)
router.get('/commissionDetails', verifyTokenFn,checkParams, controller.sales.commissionDetails)


//----------------------------------------Sales Approval --------------------------------
router.get('/getUpperLevelUserList', verifyTokenFn,checkParams, controller.salesApproval.getUpperLevelUserList)
router.post('/sendApprovalRequestForSales', verifyTokenFn,checkParams, controller.salesApproval.sendApprovalRequestForSales)
router.put('/acceptOrRejectApproveRequestForSales', verifyTokenFn,checkParams, controller.salesApproval.acceptOrRejectApproveRequestForSales)
router.get('/approveRequestDetails', verifyTokenFn,checkParams, controller.salesApproval.approveRequestDetails)
router.get('/allApproveRequestList', verifyTokenFn,checkParams, controller.salesApproval.allApproveRequestList)


//----------------------------------------Reports------------------------------------------
router.get('/revenuePerCustomer', verifyTokenFn,checkParams, controller.reports.revenuePerCustomer)
router.get('/revenuePerProduct', verifyTokenFn,checkParams, controller.reports.revenuePerProduct)
router.get('/revenuePerSalesRep', verifyTokenFn,checkParams, controller.reports.revenuePerSalesRep)
router.get('/totalRevenue', verifyTokenFn,checkParams, controller.reports.totalRevenue)
router.get('/totalLossRevenue', verifyTokenFn,checkParams, controller.reports.totalLossRevenue)
//---------------------------------------DashBoard counts -------------------------------

router.get('/revenues', verifyTokenFn,checkParams, controller.dashboard.revenues)
// router.get('/totalExpectedRevenueCounts', verifyTokenFn,checkParams, controller.dashboard.totalExpectedRevenueCounts)
router.get('/dataCreationStatus', verifyTokenFn,checkParams, controller.dashboard.dataCreationStatus)


//-------------------------------------Revenue Forecast----------------------------------

router.post('/createRevenueForecast', verifyTokenFn,checkParams, controller.revenueForecast.createRevenueForecast)
router.get('/revenueForecastList', verifyTokenFn,checkParams, controller.revenueForecast.revenueForecastList)
router.get('/forecastDetails', verifyTokenFn,checkParams, controller.revenueForecast.forecastDetails)
router.put('/auditForecast', verifyTokenFn,checkParams, controller.revenueForecast.auditForecast)
router.put('/acceptForecast', verifyTokenFn,checkParams, controller.revenueForecast.acceptForecast)
router.get('/actualVsForecast', verifyTokenFn,checkParams, controller.revenueForecast.actualVsForecast)
router.put('/editRevenueForecast', verifyTokenFn,checkParams, controller.revenueForecast.editRevenueForecast)
router.put('/updateAssignedUsersForecast', verifyTokenFn,checkParams, controller.revenueForecast.updateAssignedUsersForecast)
router.put('/deleteRevenueForecast', verifyTokenFn,checkParams, controller.revenueForecast.deleteRevenueForecast)
router.put('/deleteAssignedUserForecast', verifyTokenFn,checkParams, controller.revenueForecast.deleteAssignedUserForecast)

//---------------------------------------Business and Revenue Contact-------------------------

router.post('/addBusinessAndRevenueContact', verifyTokenFn,checkParams, controller.customers.addBusinessAndRevenueContact)

//-------------------------------------------Configurations----------------------------------
router.post('/addConfigs', verifyTokenFn,checkParams, controller.configuration.addConfigs)
router.get('/configList', verifyTokenFn,checkParams, controller.configuration.configList)
router.post('/addImapCredentials', verifyTokenFn,checkParams, controller.configuration.addImapCredentials)
router.get('/imapCredentialsList', verifyTokenFn,checkParams, controller.configuration.imapCredentials)

//------------------------------------Payment----------------------------------------
router.post('/createPayment', controller.payment.createPayment)
router.get('/subscriptionDetails', verifyTokenFn,checkParams, controller.payment.subscriptionDetails)
router.put('/cancelSubscription', verifyTokenFn,checkParams, controller.payment.cancelSubscription)
router.post('/upgradeSubscription', verifyTokenFn,checkParams, controller.payment.upgradeSubscription)


//-----------------------------------Chat----------------------------------------------
router.post("/accessChat", verifyTokenFn,checkParams, controller.chat.accessChat);
router.get("/fetchChats", verifyTokenFn,checkParams, controller.chat.fetchChats);
router.post("/createGroupChat", verifyTokenFn,checkParams, controller.chat.createGroupChat);

router.get("/allMessages/:chatId", verifyTokenFn,checkParams, controller.chat.allMessages);
router.post("/sendMessage", verifyTokenFn,checkParams, controller.chat.sendMessage);

//-----------------------------Emails to business and revenue contacts------------------------
router.post('/uploadAttechment', verifyTokenFn,checkParams, uploadMailAttechments.array('attachments', 10), controller.email.uploadMailAttechment)
router.post('/sendEmailToContact', verifyTokenFn,checkParams, controller.email.sendEmail)
router.get('/fetchEmails', verifyTokenFn,checkParams, controller.email.fetchEmails)
router.get('/inbox', verifyTokenFn,checkParams, controller.email.inbox)
router.post('/readEmail', verifyTokenFn,checkParams, controller.email.readEmail)
router.get('/SentEmailList/:salesId', verifyTokenFn,checkParams, controller.email.SentEmailList)

//-------------------------------Leads-----------------------------------------
router.post('/createLead', verifyTokenFn,checkParams, controller.leads.createLead)
router.get('/leadsList', verifyTokenFn,checkParams, controller.leads.leadsList)
router.get('/leadsDetails', verifyTokenFn,checkParams, controller.leads.leadsDetails)
router.put('/updateLead', verifyTokenFn,checkParams, controller.leads.updateLead)
router.put('/deleteLead', verifyTokenFn,checkParams, controller.leads.deleteLead)
router.put('/rejectLead', verifyTokenFn,checkParams, controller.leads.rejectLead)
router.post('/uploadLeadsFile', verifyTokenFn,checkParams, uploadLeadsFile.single('file'), controller.leads.uploadLeadFile)

//-------------------------------Marketing strategy-----------------------------------------
router.get('/marketingDashboard', verifyTokenFn,checkParams, controller.marketingStrategy.marketingDashboard)

router.post('/addBudget', verifyTokenFn,checkParams, controller.marketingStrategy.addBudget)
router.get('/budgetList', verifyTokenFn,checkParams, controller.marketingStrategy.budgetList)
router.get('/budgetDetails', verifyTokenFn,checkParams, controller.marketingStrategy.budgetDetails)
router.put('/deleteBudget', verifyTokenFn,checkParams, controller.marketingStrategy.deleteBudget)
router.put('/updateBudget', verifyTokenFn,checkParams, controller.marketingStrategy.updateBudget)
router.get('/budgetLogList', verifyTokenFn,checkParams, controller.marketingStrategy.budgetLogList)
router.put('/deleteDescription', verifyTokenFn,checkParams, controller.marketingStrategy.deleteDescription)
router.put('/finalizeBudget', verifyTokenFn,checkParams, controller.marketingStrategy.finalizeBudget)


//-----------------------------------Lead Title--------------------------------------------
router.post('/addLeadTitle', verifyTokenFn,checkParams, controller.configuration.addLeadTitle)
router.get('/leadTitleList', verifyTokenFn,checkParams, controller.configuration.leadTitleList)
router.put('/updateLeadTitle', verifyTokenFn,checkParams, controller.configuration.updateLeadTitle)
router.put('/deleteLeadTitle', verifyTokenFn,checkParams, controller.configuration.deleteLeadTitle)

router.post('/addLeadIndustry', verifyTokenFn,checkParams, controller.configuration.addLeadIndustry)
router.get('/leadIndustryList', verifyTokenFn,checkParams, controller.configuration.leadIndustryList)
router.put('/updateLeadIndustry', verifyTokenFn,checkParams, controller.configuration.updateLeadIndustry)
router.put('/deleteLeadIndustry', verifyTokenFn,checkParams, controller.configuration.deleteLeadIndustry)

router.post('/addLeadSource', verifyTokenFn,checkParams, controller.configuration.addLeadSource)
router.get('/leadSourceList', verifyTokenFn,checkParams, controller.configuration.leadSourceList)
router.put('/updateLeadSource', verifyTokenFn,checkParams, controller.configuration.updateLeadSource)
router.put('/deleteLeadSource', verifyTokenFn,checkParams, controller.configuration.deleteLeadSource)



//----------------------------------------Notifications------------------------------------
router.get('/notificationList', verifyTokenFn,checkParams, controller.notifications.notificationList)
router.get('/notifications', verifyTokenFn,checkParams, controller.notifications.allNotificationList)
router.put('/notificationRead', verifyTokenFn,checkParams, controller.notifications.notificationRead)


//-----------------------------------------Connectors------------------------------
router.get('/connectorList',verifyTokenFn,checkParams,controller.proUser.connectorsList)
router.get('/auth/authUrl',controller.proUser.authUrl);
router.post('/auth/callback',verifyTokenFn,checkParams,controller.proUser.callback)
router.get('/leadReSync',verifyTokenFn,checkParams,controller.proUser.leadReSync)
router.get('/proLeadsList',verifyTokenFn,checkParams,controller.proUser.proLeadsList)
router.get('/salesListForPro',verifyTokenFn,checkParams,controller.proUser.salesListForPro)
router.get('/recognizationDetailsPro',verifyTokenFn,checkParams,controller.proUser.recognizationDetailsPro)
router.post('/addAvailability',verifyTokenFn,checkParams,controller.proUser.addAvailability)
router.get('/availabilityList',verifyTokenFn,checkParams, controller.proUser.availableTimeList)

//pro email 
router.post('/createProEmailTemplate',verifyTokenFn,checkParams,controller.proUser.createProEmailTemplate)
router.get('/emailTemplateList',verifyTokenFn,checkParams,controller.proUser.emailTemplateList)
router.put('/updateEmailTemplate',verifyTokenFn,checkParams,controller.proUser.updateEmailTemplate)
router.put('/deleteEmailTemplate',verifyTokenFn,checkParams,controller.proUser.deleteEmailTemplate)
router.post('/addSmtpCreds',verifyTokenFn,checkParams, controller.proUser.addSmtpCreds)
router.get('/credentialList', verifyTokenFn,checkParams, controller.proUser.credentialList)
router.post('/sendEmailToLead', verifyTokenFn,checkParams,controller.proUser.sendEmailToLead)

//event and calendar for pro
router.post('/createEvent',verifyTokenFn,checkParams,controller.proUser.createEvent)
router.get('/eventsList',verifyTokenFn,checkParams,controller.proUser.eventsList)
router.get('/eventDetails', controller.proUser.eventDetails)
router.post('/scheduleEvent',controller.proUser.scheduleEvent)
router.get('/scheduledEventsList', verifyTokenFn,checkParams, controller.proUser.scheduledEventsList)
router.get('/availabilityDetails',verifyTokenFn,checkParams,controller.proUser.availabilityDetails)
router.put('/updateAvailability',verifyTokenFn,checkParams,controller.proUser.updateAvailability)
router.put('/deleteAvalability',verifyTokenFn,checkParams,controller.proUser.deleteAvalability)
router.put('/deleteTimeSlot',verifyTokenFn,checkParams,controller.proUser.deleteTimeSlot)
router.put('/updateEvent',verifyTokenFn,checkParams,controller.proUser.updateEvent)
router.put('/deleteEvent',verifyTokenFn,checkParams,controller.proUser.deleteEvent)

//Sales Analysis
router.get('/salesCaptainList', verifyTokenFn,checkParams, controller.proUser.salesCaptainList)
router.get('/captainWiseSalesDetails', verifyTokenFn,checkParams, controller.proUser.captainWiseSalesDetails);
router.get('/sciiSales',verifyTokenFn,checkParams, controller.proUser.sciiSales)
router.get('/captainWiseGraph',verifyTokenFn,checkParams, controller.proUser.captainWiseGraph)



module.exports = router;