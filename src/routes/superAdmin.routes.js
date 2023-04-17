const express = require('express')
var router = express.Router()
var controller = require('../controllers/index')
const { verifyTokenFn1 } = require('../utils/jwt')

router.post('/login',controller.superAdmin.login)
router.post('/forgetPassword', controller.superAdmin.forgotPassword)
router.post('/resetPassword', controller.superAdmin.resetPassword)

router.get('/showProfile',verifyTokenFn1, controller.superAdmin.showProfile)
router.get('/companiesList',verifyTokenFn1,controller.superAdmin.companiesList)
router.get('/showUsersByCompanyId',verifyTokenFn1,controller.superAdmin.showUsersByCompanyId)
router.get('/userWiseCompanyRevenue', verifyTokenFn1, controller.superAdmin.userWiseCompanyRevenue)
router.get('/dashboard', verifyTokenFn1, controller.superAdmin.dashboard)
router.get('/totalExpectedRevenueCounts', verifyTokenFn1, controller.superAdmin.totalExpectedRevenueCounts)
router.put('/lockOrUnlockCompany', verifyTokenFn1, controller.superAdmin.lockOrUnlockCompany)
//------------------------------------------plans----------------------------------------

router.post('/addPlan', verifyTokenFn1, controller.superAdmin.addPlan)
router.get('/plansList', verifyTokenFn1, controller.superAdmin.plansList)
router.put('/updatePlan', verifyTokenFn1, controller.superAdmin.updatePlan)
router.put('/activateOrDeactivatePlan', verifyTokenFn1, controller.superAdmin.activateOrDeactivatePlan)

//-------------------------------Config-----------------------------------
router.post('/addConfig', verifyTokenFn1, controller.superAdmin.addConfig)
router.get('/configList', verifyTokenFn1, controller.superAdmin.configList)

//----------------------------------------------------------------------------
router.get('/subcribedCompaniesList', verifyTokenFn1,controller.superAdmin.subcribedCompaniesList)
router.get('/trialCompaniesList', verifyTokenFn1,controller.superAdmin.trialCompaniesList)
router.get('/allTrialAndSubcribedCompaniesList', verifyTokenFn1,controller.superAdmin.allTrialAndSubcribedCompaniesList)

router.get('/activeAndCanceledCompanies', verifyTokenFn1 , controller.superAdmin.activeAndCanceledCompanies)
router.get('/planwiseCompaniesList/:planId', verifyTokenFn1, controller.superAdmin.planwiseCompaniesList)
router.put('/extendExpiryByCompanyId/:companyId', verifyTokenFn1, controller.superAdmin.extendExpiryByCompanyId)

//-----------------------------Enable/disable Imap service--------------------
router.put('/enableDisableImapService', verifyTokenFn1, controller.superAdmin.enableDisableImapService)

//-----------------------------Enable/disable marketing service--------------------
router.put('/enableDisableMarketingService', verifyTokenFn1, controller.superAdmin.enableDisableMarketingService)

//----------------------------Contact us Queries List-------------------------
router.get('/contactUsQueriesList', verifyTokenFn1,controller.superAdmin.contactUsQueriesList)

module.exports = router;