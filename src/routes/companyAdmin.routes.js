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
router.post('/assignRoleToUser',verifyTokenFn, controller.companyAdmin.assignRoleToUser)
router.get('/usersListByRoleId',verifyTokenFn, controller.companyAdmin.usersListByRoleId)
router.get('/userWiseRoleList',verifyTokenFn, controller.companyAdmin.userWiseRoleList)
router.put('/deleteRole' , verifyTokenFn, controller.companyAdmin.deleteRole)

//-------------------------------------Slabss-------------------------------------------------
router.get('/slabList',verifyTokenFn, controller.companyAdmin.slabList)
router.post('/createSlab',verifyTokenFn, controller.companyAdmin.createSlab)
//router.post('/assignQuotationToUser',verifyTokenFn, controller.companyAdmin.assignQuotationToUser)
router.put('/updateSlab',verifyTokenFn, controller.companyAdmin.updateSlab)
router.put('/deleteSlab',verifyTokenFn, controller.companyAdmin.deleteSlab)

//-------------------------------------sales-------------------------------------------------
// router.get('/salesReportList',verifyTokenFn, controller.companyAdmin.salesReportList)
// router.get('/salesReportByUserId',verifyTokenFn, controller.companyAdmin.salesReportByUserId)

//-------------------------------------leads--------------------------------------------
router.post('/createLead',verifyTokenFn, controller.companyAdmin.createLead)
router.get('/leadsList',verifyTokenFn, controller.companyAdmin.leadsList)
router.put('/updateLead',verifyTokenFn, controller.companyAdmin.updateLead)
router.put('/deleteLead',verifyTokenFn, controller.companyAdmin.deleteLead)
router.get('/showleadsById',verifyTokenFn, controller.companyAdmin.showleadsById)
router.post('/uploadLeadFile',verifyTokenFn,uploadLeadFile.single('file'), controller.companyAdmin.uploadLeadFile)
router.get('/userWiseLeadList',verifyTokenFn, controller.companyAdmin.userWiseLeadList)

//--------------------------------------Targets--------------------------------------------

router.post('/convertLeadToTarget',verifyTokenFn, controller.companyAdmin.convertLeadToTarget)
router.get('/targetList',verifyTokenFn, controller.companyAdmin.targetList)
router.post('/addfollowUpNotes' , verifyTokenFn, controller.companyAdmin.addfollowUpNotes)
router.get('/notesList',verifyTokenFn, controller.companyAdmin.notesList)

//----------------------------------------Reports------------------------------------------

router.get('/leadReport',verifyTokenFn, controller.companyAdmin.leadReport)
router.get('/leadConversionReport',verifyTokenFn, controller.companyAdmin.leadConversionReport)

//------------------------------------Deal Management---------------------------------------

router.post('/createDeal',verifyTokenFn, controller.companyAdmin.createDeal)
router.post('/closeDeal',verifyTokenFn, controller.companyAdmin.closeDeal)
router.get('/dealList',verifyTokenFn, controller.companyAdmin.dealList)
router.put('/editDeal',verifyTokenFn, controller.companyAdmin.editDeal)
router.get('/dealLogsList',verifyTokenFn, controller.companyAdmin.dealLogsList)
router.get('/dealCompanyList',verifyTokenFn, controller.companyAdmin.dealCompanyList)
router.put('/deleteDeal',verifyTokenFn, controller.companyAdmin.deleteDeal)

router.post('/assignDealSupporter',verifyTokenFn, controller.companyAdmin.assignDealSupporter)

router.post('/commissionSplit',verifyTokenFn, controller.companyAdmin.commissionSplit)
router.put('/updatecommissionSplit',verifyTokenFn, controller.companyAdmin.updatecommissionSplit)
router.get('/commissionSplitList',verifyTokenFn, controller.companyAdmin.commissionSplitList)
router.put('/deletecommissionSplit',verifyTokenFn, controller.companyAdmin.deletecommissionSplit)

router.get('/dealListforSales',verifyTokenFn, controller.companyAdmin.dealListforSales)

router.post('/createSalesConversion',verifyTokenFn, controller.companyAdmin.createSalesConversion)
router.get('/salesConversionList',verifyTokenFn, controller.companyAdmin.salesConversionList)

module.exports = router;