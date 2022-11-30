const express = require('express')
var router = express.Router()
var controller = require('../controllers/index')
const { verifyTokenFn } = require('../utils/jwt')
const {uploadAvatar , uploadProductImage, uploadProductFile, uploadMailAttechments } = require('../utils/uploadfiles')

router.post('/upload',verifyTokenFn, uploadAvatar.single('image'),controller.companyAdmin.upload);
router.get('/showProfile',verifyTokenFn, controller.companyAdmin.showProfile)
router.put('/updateProfile',verifyTokenFn, controller.companyAdmin.updateUserProfile)
router.put('/changePassword',verifyTokenFn, controller.companyAdmin.changePassword)

//-------------------------------------Users-------------------------------------------------
router.post('/addUser' , verifyTokenFn, controller.users.addUser)
router.get('/usersList',verifyTokenFn, controller.users.usersList)
router.get('/showUserById' , verifyTokenFn, controller.users.showUserById)
router.put('/updateUser' , verifyTokenFn, controller.users.updateUser)
router.put('/deleteUser' , verifyTokenFn, controller.users.deleteUser)
router.put('/lockUserAccount' , verifyTokenFn, controller.users.lockUserAccount)

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
router.put('/deleteSlab',verifyTokenFn, controller.slabs.deleteSlab)

//--------------------------------------followUpNotes--------------------------------------------

router.post('/addfollowUpNotes' , verifyTokenFn, controller.sales.addfollowUpNotes)
router.get('/notesList',verifyTokenFn, controller.sales.notesList)
router.put('/deleteNotes',verifyTokenFn, controller.sales.deleteNote)


//------------------------------------customers---------------------------------------

router.post('/createCustomer',verifyTokenFn, controller.customers.createCustomer)
router.post('/closeCustomer',verifyTokenFn, controller.customers.closeCustomer)
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
router.get('/salesCommissionList',verifyTokenFn, controller.sales.salesCommissionList)
router.put('/updateSalesCommission',verifyTokenFn, controller.sales.updateSalesCommission)
router.put('/deleteSalesCommission',verifyTokenFn, controller.sales.deleteSalesCommission)
router.get('/salesCommissionLogsList',verifyTokenFn, controller.sales.salesCommissionLogsList)
//----------------------------------------Reports------------------------------------------
router.get('/revenuePerCustomer',verifyTokenFn, controller.reports.revenuePerCustomer)
router.get('/revenuePerProduct',verifyTokenFn, controller.reports.revenuePerProduct)
router.get('/revenuePerSalesRep',verifyTokenFn, controller.reports.revenuePerSalesRep)
router.get('/totalRevenue',verifyTokenFn, controller.reports.totalRevenue)
//---------------------------------------DashBoard counts -------------------------------

router.get('/revenues',verifyTokenFn, controller.dashboard.revenues)


//-------------------------------------Revenue Forecast----------------------------------

router.post('/createRevenueForecast',verifyTokenFn, controller.revenueForecast.createRevenueForecast)
router.get('/revenueForecastList',verifyTokenFn, controller.revenueForecast.revenueForecastList)
router.put('/deleteRevenueForecast', verifyTokenFn, controller.revenueForecast.deleteRevenueForecast)
router.get('/actualVsForecast',verifyTokenFn, controller.revenueForecast.actualVsForecast)

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




module.exports = router;