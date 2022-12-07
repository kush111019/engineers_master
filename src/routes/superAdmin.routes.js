const express = require('express')
var router = express.Router()
var controller = require('../controllers/index')
const { verifyTokenFn } = require('../utils/jwt')
const {uploadLogo} = require('../utils/uploadfiles')

router.post('/login',controller.superAdmin.login)
router.post('/forgetPassword', controller.superAdmin.forgotPassword)
router.post('/resetPassword', controller.superAdmin.resetPassword)

router.get('/showProfile',verifyTokenFn, controller.superAdmin.showProfile)
router.get('/companiesList',verifyTokenFn,controller.superAdmin.companiesList)
router.get('/showUsersByCompanyId',verifyTokenFn,controller.superAdmin.showUsersByCompanyId)
router.get('/userWiseCompanyRevenue', verifyTokenFn, controller.superAdmin.userWiseCompanyRevenue)
router.get('/dashboard', verifyTokenFn, controller.superAdmin.dashboard)
router.get('/totalExpectedRevenueCounts', verifyTokenFn, controller.superAdmin.totalExpectedRevenueCounts)

//------------------------------------------plans----------------------------------------

router.post('/addPlan', verifyTokenFn, controller.superAdmin.addPlan)
router.get('/plansList', verifyTokenFn, controller.superAdmin.plansList)
router.put('/updatePlan', verifyTokenFn, controller.superAdmin.updatePlan)
router.put('/activateOrDeactivatePlan', verifyTokenFn, controller.superAdmin.activateOrDeactivatePlan)

//-------------------------------Config-----------------------------------
router.post('/addConfig', verifyTokenFn, controller.superAdmin.addConfig)
router.get('/configList', verifyTokenFn, controller.superAdmin.configList)

//----------------------------------------------------------------------------
router.get('/subcribedCompaniesList', verifyTokenFn,controller.superAdmin.subcribedCompaniesList)
router.get('/activeAndCanceledCompanies', verifyTokenFn , controller.superAdmin.activeAndCanceledCompanies)
router.get('/planwiseCompaniesList/:planId', verifyTokenFn, controller.superAdmin.planwiseCompaniesList)
router.put('/extendExpiryByCompanyId/:companyId', verifyTokenFn, controller.superAdmin.extendExpiryByCompanyId)

//-----------------------------Enable/disable Imap service--------------------
router.put('/enableDisableImapService', verifyTokenFn, controller.superAdmin.enableDisableImapService)

module.exports = router;