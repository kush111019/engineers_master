const express = require('express')
var router = express.Router()
var controller = require('../controllers/index')
const { verifyTokenFn } = require('../utils/jwt')
const {uploadAvatar , uploadLeadFile} = require('../utils/uploadfiles')

router.post('/upload',verifyTokenFn, uploadAvatar.single('image'),controller.companyAdmin.upload);
router.get('/showProfile',verifyTokenFn, controller.companyAdmin.showProfile)
router.put('/updateProfile',verifyTokenFn, controller.companyAdmin.updateUserProfile)
router.put('/changePassword',verifyTokenFn, controller.companyAdmin.changePassword)
router.post('/forgotPassword',controller.companyAdmin.forgotPassword)
router.post('/resetPassword',controller.companyAdmin.resetPassword)

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
//router.post('/assignRoleToUser',verifyTokenFn, controller.companyAdmin.assignRoleToUser)
router.get('/usersListByRoleId',verifyTokenFn, controller.companyAdmin.usersListByRoleId)
router.get('/userWiseRoleList',verifyTokenFn, controller.companyAdmin.userWiseRoleList)
router.put('/deleteRole' , verifyTokenFn, controller.companyAdmin.deleteRole)

//-------------------------------------Slabs-------------------------------------------------
// router.get('/slabList',verifyTokenFn, controller.companyAdmin.slabList)
// router.post('/createSlab',verifyTokenFn, controller.companyAdmin.createSlab)
// router.put('/updateSlab',verifyTokenFn, controller.companyAdmin.updateSlab)
// router.put('/deleteSlab',verifyTokenFn, controller.companyAdmin.deleteSlab)


// router.post('/uploadLeadFile',verifyTokenFn,uploadLeadFile.single('file'), controller.companyAdmin.uploadLeadFile)


//--------------------------------------Targets--------------------------------------------

router.post('/addfollowUpNotes' , verifyTokenFn, controller.companyAdmin.addfollowUpNotes)
router.get('/notesList',verifyTokenFn, controller.companyAdmin.notesList)
router.put('/deleteNotes',verifyTokenFn, controller.companyAdmin.deleteNotes)


//------------------------------------Deal Management---------------------------------------

router.post('/createDeal',verifyTokenFn, controller.companyAdmin.createDeal)
router.post('/closeDeal',verifyTokenFn, controller.companyAdmin.closeDeal)
router.get('/dealList',verifyTokenFn, controller.companyAdmin.dealList)
router.put('/editDeal',verifyTokenFn, controller.companyAdmin.editDeal)
router.get('/dealLogsList',verifyTokenFn, controller.companyAdmin.dealLogsList)
router.get('/dealCompanyList',verifyTokenFn, controller.companyAdmin.dealCompanyList)
router.put('/deleteDeal',verifyTokenFn, controller.companyAdmin.deleteDeal)

//------------------------------------Commisions-----------------------------------------
router.post('/commissionSplit',verifyTokenFn, controller.companyAdmin.commissionSplit)
router.put('/updatecommissionSplit',verifyTokenFn, controller.companyAdmin.updatecommissionSplit)
router.get('/commissionSplitList',verifyTokenFn, controller.companyAdmin.commissionSplitList)
router.put('/deletecommissionSplit',verifyTokenFn, controller.companyAdmin.deletecommissionSplit)

//----------------------------------------sales conversion --------------------------------
router.get('/dealListforSales',verifyTokenFn, controller.companyAdmin.dealListforSales)

router.post('/createSalesConversion',verifyTokenFn, controller.companyAdmin.createSalesConversion)
router.get('/salesConversionList',verifyTokenFn, controller.companyAdmin.salesConversionList)
router.put('/updateSalesConversion',verifyTokenFn, controller.companyAdmin.updateSalesConversion)
router.put('/deleteSalesConversion',verifyTokenFn, controller.companyAdmin.deleteSalesConversion)

//----------------------------------------Reports------------------------------------------
router.get('/salesConversionReport',verifyTokenFn, controller.companyAdmin.salesConversionReport)




module.exports = router;