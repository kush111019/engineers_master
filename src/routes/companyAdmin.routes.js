const express = require('express')
var router = express.Router()
var controller = require('../controllers/index')
const { verifyTokenFn } = require('../utils/jwt')
const {uploadAvatar , uploadLeadFile} = require('../utils/uploadfiles')

router.post('/upload',verifyTokenFn, uploadAvatar.single('image'),controller.companyAdmin.upload);
router.get('/showProfile',verifyTokenFn, controller.companyAdmin.showProfile)
router.put('/updateProfile',verifyTokenFn, controller.companyAdmin.updateUserProfile)
router.put('/changePassword',verifyTokenFn, controller.companyAdmin.changePassword)

//-------------------------------------Users-------------------------------------------------
router.post('/addUser' , verifyTokenFn, controller.companyAdmin.addUser)
router.get('/usersList',verifyTokenFn, controller.companyAdmin.usersList)
router.get('/showUserById' , verifyTokenFn, controller.companyAdmin.showUserById)
router.put('/updateUser' , verifyTokenFn, controller.companyAdmin.updateUser)
router.put('/deleteUser' , verifyTokenFn, controller.companyAdmin.deleteUser)
router.put('/lockUserAccount' , verifyTokenFn, controller.companyAdmin.lockUserAccount)


//---------------------------------------modules------------------------------------------

router.get('/moduleList',verifyTokenFn, controller.companyAdmin.moduleList)

//-------------------------------------Roles-------------------------------------------------
router.get('/rolesList',verifyTokenFn, controller.companyAdmin.rolesList)
router.post('/createRole',verifyTokenFn, controller.companyAdmin.createRole)
router.put('/updateRole' , verifyTokenFn, controller.companyAdmin.updateRole)
router.get('/usersListByRoleId',verifyTokenFn, controller.companyAdmin.usersListByRoleId)
router.get('/userWiseRoleList',verifyTokenFn, controller.companyAdmin.userWiseRoleList)
router.put('/deleteRole' , verifyTokenFn, controller.companyAdmin.deleteRole)

//-------------------------------------Slabs-------------------------------------------------
router.get('/slabList',verifyTokenFn, controller.companyAdmin.slabList)
router.post('/createSlab',verifyTokenFn, controller.companyAdmin.createSlab)
router.put('/deleteSlab',verifyTokenFn, controller.companyAdmin.deleteSlab)

//--------------------------------------followUpNotes--------------------------------------------

router.post('/addfollowUpNotes' , verifyTokenFn, controller.companyAdmin.addfollowUpNotes)
router.get('/notesList',verifyTokenFn, controller.companyAdmin.notesList)
router.put('/deleteNotes',verifyTokenFn, controller.companyAdmin.deleteNote)


//------------------------------------Deal Management---------------------------------------

router.post('/createCustomer',verifyTokenFn, controller.companyAdmin.createCustomer)
router.post('/closeCustomer',verifyTokenFn, controller.companyAdmin.closeCustomer)
router.get('/customerList',verifyTokenFn, controller.companyAdmin.customerList)
router.put('/editCustomer',verifyTokenFn, controller.companyAdmin.editCustomer)
router.put('/deleteContactForCustomer',verifyTokenFn, controller.companyAdmin.deleteContactForCustomer)

router.get('/customerCompanyList',verifyTokenFn, controller.companyAdmin.customerCompanyList)
router.get('/customerContactDetails',verifyTokenFn, controller.companyAdmin.customerContactDetails)
router.put('/deleteCustomer',verifyTokenFn, controller.companyAdmin.deleteCustomer)

//------------------------------------Commisions-----------------------------------------
router.post('/commissionSplit',verifyTokenFn, controller.companyAdmin.commissionSplit)
router.put('/updatecommissionSplit',verifyTokenFn, controller.companyAdmin.updatecommissionSplit)
router.get('/commissionSplitList',verifyTokenFn, controller.companyAdmin.commissionSplitList)
router.put('/deletecommissionSplit',verifyTokenFn, controller.companyAdmin.deletecommissionSplit)

//----------------------------------------sales conversion --------------------------------
router.get('/customerListforSales',verifyTokenFn, controller.companyAdmin.customerListforSales)
router.get('/customerContactDetailsForSales',verifyTokenFn, controller.companyAdmin.customerContactDetailsForSales)

router.post('/createSalesCommission',verifyTokenFn, controller.companyAdmin.createSalesCommission)
router.get('/salesCommissionList',verifyTokenFn, controller.companyAdmin.salesCommissionList)
router.put('/updateSalesCommission',verifyTokenFn, controller.companyAdmin.updateSalesCommission)
router.put('/deleteSalesCommission',verifyTokenFn, controller.companyAdmin.deleteSalesCommission)
router.get('/salesCommissionLogsList',verifyTokenFn, controller.companyAdmin.salesCommissionLogsList)
//----------------------------------------Reports------------------------------------------
router.get('/salesCommissionReport',verifyTokenFn, controller.companyAdmin.salesCommissionReport)

//---------------------------------------DashBoard counts -------------------------------

router.get('/revenues',verifyTokenFn, controller.companyAdmin.revenues)

//-------------------------------------Revenue Forecast----------------------------------

router.post('/createRevenueForecast',verifyTokenFn, controller.companyAdmin.createRevenueForecast)
router.put('/updateRevenueForecast',verifyTokenFn, controller.companyAdmin.updateRevenueForecast)
router.get('/revenueForecastList',verifyTokenFn, controller.companyAdmin.revenueForecastList)
router.get('/actualVsForecast',verifyTokenFn, controller.companyAdmin.actualVsForecast)

//---------------------------------------Business and Revenue Contact-------------------------

router.post('/addBusinessContact',verifyTokenFn, controller.companyAdmin.addBusinessContact)
router.post('/addRevenueContact',verifyTokenFn, controller.companyAdmin.addRevenueContact)

//-------------------------------------------Configurations----------------------------------
router.post('/addConfigs', verifyTokenFn, controller.companyAdmin.addConfigs)
router.get('/configList', verifyTokenFn, controller.companyAdmin.configList)

module.exports = router;