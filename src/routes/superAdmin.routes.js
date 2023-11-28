const express = require('express')
var router = express.Router()
var controller = require('../controllers/index')
const { verifyTokenFn1 } = require('../utils/jwt')
const { checkParams } = require('../utils/helper')

router.post('/login',checkParams,controller.superAdmin.login)
router.post('/forgetPassword', checkParams,controller.superAdmin.forgotPassword)
router.post('/resetPassword', checkParams,controller.superAdmin.resetPassword)

router.get('/showProfile',verifyTokenFn1, checkParams, controller.superAdmin.showProfile)
router.get('/companiesList',verifyTokenFn1, checkParams,controller.superAdmin.companiesList)
router.get('/showUsersByCompanyId',verifyTokenFn1, checkParams,controller.superAdmin.showUsersByCompanyId)
router.get('/userWiseCompanyRevenue', verifyTokenFn1, checkParams, controller.superAdmin.userWiseCompanyRevenue)
router.get('/dashboard', verifyTokenFn1, checkParams, controller.superAdmin.dashboard)
router.get('/totalExpectedRevenueCounts', verifyTokenFn1, checkParams, controller.superAdmin.totalExpectedRevenueCounts)
router.put('/lockOrUnlockCompany', verifyTokenFn1, checkParams, controller.superAdmin.lockOrUnlockCompany)
//------------------------------------------plans----------------------------------------

router.post('/addPlan', verifyTokenFn1, checkParams, controller.superAdmin.addPlan)
router.get('/plansList', verifyTokenFn1, checkParams, controller.superAdmin.plansList)
router.put('/updatePlan', verifyTokenFn1, checkParams, controller.superAdmin.updatePlan)
router.put('/activateOrDeactivatePlan', verifyTokenFn1, checkParams, controller.superAdmin.activateOrDeactivatePlan)

//-------------------------------Config-----------------------------------
router.post('/addConfig', verifyTokenFn1, checkParams, controller.superAdmin.addConfig)
router.get('/configList', verifyTokenFn1, checkParams, controller.superAdmin.configList)

//----------------------------------------------------------------------------
router.get('/subcribedCompaniesList', verifyTokenFn1, checkParams,controller.superAdmin.subcribedCompaniesList)
router.get('/trialCompaniesList', verifyTokenFn1, checkParams,controller.superAdmin.trialCompaniesList)
router.get('/allTrialAndSubcribedCompaniesList', verifyTokenFn1, checkParams,controller.superAdmin.allTrialAndSubcribedCompaniesList)

router.get('/activeAndCanceledCompanies', verifyTokenFn1 , controller.superAdmin.activeAndCanceledCompanies)
router.get('/planwiseCompaniesList/:planId', verifyTokenFn1, checkParams, controller.superAdmin.planwiseCompaniesList)
router.put('/extendExpiryByCompanyId/:companyId', verifyTokenFn1, checkParams, controller.superAdmin.extendExpiryByCompanyId)

//-----------------------------Enable/disable Imap service--------------------
router.put('/enableDisableImapService', verifyTokenFn1, checkParams, controller.superAdmin.enableDisableImapService)

//-----------------------------Enable/disable marketing service--------------------
router.put('/enableDisableMarketingService', verifyTokenFn1, checkParams, controller.superAdmin.enableDisableMarketingService)

//----------------------------Contact us Queries List-------------------------
router.get('/contactUsQueriesList', verifyTokenFn1, checkParams,controller.superAdmin.contactUsQueriesList)

//-------------------------------Events for Super Admin-------------------------
router.post('/addAvailability', verifyTokenFn1, checkParams, controller.superAdmin.addAvailability);
router.get('/listAvailability', verifyTokenFn1, checkParams, controller.superAdmin.listAvailability);
router.get('/detailAvailability', verifyTokenFn1, checkParams, controller.superAdmin.detailAvailability);
router.put('/updateAvailability', verifyTokenFn1, checkParams, controller.superAdmin.updateAvailability);
router.put('/deleteAvailability', verifyTokenFn1, checkParams, controller.superAdmin.deleteAvailability);

router.post('/addEvents', verifyTokenFn1, checkParams, controller.superAdmin.addEvents);
router.get('/listEvents', verifyTokenFn1, checkParams, controller.superAdmin.listEvents);
router.put('/updateEvents', verifyTokenFn1, checkParams, controller.superAdmin.updateEvents);
router.put('/deleteEvents', verifyTokenFn1, checkParams, controller.superAdmin.deleteEvents);

router.get('/scheduledEvents', verifyTokenFn1, checkParams, controller.superAdmin.scheduledEvents);

module.exports = router;