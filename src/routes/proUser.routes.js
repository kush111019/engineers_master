const express = require('express')
var router = express.Router()
var controller = require('../controllers/index')
const { verifyTokenFnForPro } = require('../utils/jwt')
const {checkParams} = require('../utils/helper')

router.get('/showProfile', verifyTokenFnForPro,checkParams,controller.proUser.showProfile)
router.get('/usersList', verifyTokenFnForPro,checkParams,controller.proUser.usersList)
router.put('/changePassword', verifyTokenFnForPro,checkParams,controller.proUser.changePassword)
//-----------------------------------------Connectors------------------------------
router.get('/connectorList',verifyTokenFnForPro,checkParams,controller.proUser.connectorsList)
router.get('/auth/authUrl',controller.proUser.authUrl);
router.post('/auth/callback',verifyTokenFnForPro,checkParams,controller.proUser.callback)
router.get('/leadReSync',verifyTokenFnForPro,checkParams,controller.proUser.leadReSync)
router.get('/proLeadsList',verifyTokenFnForPro,checkParams,controller.proUser.proLeadsList)
router.get('/salesListForPro',verifyTokenFnForPro,checkParams,controller.proUser.salesListForPro)
router.get('/recognizationDetailsPro',verifyTokenFnForPro,checkParams,controller.proUser.recognizationDetailsPro)
router.post('/addAvailability',verifyTokenFnForPro,checkParams,controller.proUser.addAvailability)
router.get('/availabilityList',verifyTokenFnForPro,checkParams, controller.proUser.availableTimeList)

//pro email 
router.post('/createProEmailTemplate',verifyTokenFnForPro,checkParams,controller.proUser.createProEmailTemplate)
router.get('/emailTemplateList',verifyTokenFnForPro,checkParams,controller.proUser.emailTemplateList)
router.put('/updateEmailTemplate',verifyTokenFnForPro,checkParams,controller.proUser.updateEmailTemplate)
router.put('/deleteEmailTemplate',verifyTokenFnForPro,checkParams,controller.proUser.deleteEmailTemplate)
router.post('/addSmtpCreds',verifyTokenFnForPro,checkParams, controller.proUser.addSmtpCreds)
router.get('/credentialList', verifyTokenFnForPro,checkParams, controller.proUser.credentialList)
router.post('/sendEmailToLead', verifyTokenFnForPro,checkParams,controller.proUser.sendEmailToLead)
router.get('/getEmailToLead', verifyTokenFnForPro,checkParams,controller.proUser.getEmailToLead)

//event and calendar for pro
router.post('/createEvent',verifyTokenFnForPro,checkParams,controller.proUser.createEvent)
router.get('/eventsList',verifyTokenFnForPro,checkParams,controller.proUser.eventsList)
router.get('/eventDetails', controller.proUser.eventDetails)
router.post('/scheduleEvent',controller.proUser.scheduleEvent)
router.get('/scheduledEventsList', verifyTokenFnForPro,checkParams, controller.proUser.scheduledEventsList)
router.get('/availabilityDetails',verifyTokenFnForPro,checkParams,controller.proUser.availabilityDetails)
router.put('/updateAvailability',verifyTokenFnForPro,checkParams,controller.proUser.updateAvailability)
router.put('/deleteAvalability',verifyTokenFnForPro,checkParams,controller.proUser.deleteAvalability)
router.put('/deleteTimeSlot',verifyTokenFnForPro,checkParams,controller.proUser.deleteTimeSlot)
router.put('/updateEvent',verifyTokenFnForPro,checkParams,controller.proUser.updateEvent)
router.put('/deleteEvent',verifyTokenFnForPro,checkParams,controller.proUser.deleteEvent)

//Sales Analysis
router.get('/salesCaptainList', verifyTokenFnForPro,checkParams, controller.proUser.salesCaptainList)
router.get('/salesCaptainListForMetrics', verifyTokenFnForPro,checkParams, controller.proUser.salesCaptainListForMetrics)
router.get('/captainWiseSalesDetails', verifyTokenFnForPro,checkParams, controller.proUser.captainWiseSalesDetails);
router.get('/sciiSales',verifyTokenFnForPro,checkParams, controller.proUser.sciiSales)
router.get('/captainWiseGraph',verifyTokenFnForPro,checkParams, controller.proUser.captainWiseGraph)
router.get('/commissionReport', verifyTokenFnForPro,checkParams, controller.proUser.commissionReport)

// router.get('/salesMetricsData', verifyTokenFnForPro,checkParams, controller.proUser.salesMetricsData)
router.post('/salesMetricsReport', verifyTokenFnForPro,checkParams, controller.proUser.salesMetricsReport)

router.get('/salesDetails', verifyTokenFnForPro,checkParams, controller.proUser.salesDetails)
router.get('/getUpperLevelUserList', verifyTokenFnForPro ,checkParams, controller.proUser.getUpperLevelUserList)
router.get('/getAllApiDeatilsRelatedSales', verifyTokenFnForPro,checkParams, controller.proUser.getAllApiDeatilsRelatedSales)

router.get('/usersListForGlobalAndOwn', verifyTokenFnForPro,checkParams, controller.proUser.usersListForGlobalAndOwn)
router.get('/salesCaptainListForGlobalAndOwn', verifyTokenFnForPro,checkParams, controller.proUser.salesCaptainListForGlobalAndOwn)
router.get('/salesCaptainListForMetricsGlobalAndOwn', verifyTokenFnForPro,checkParams, controller.proUser.salesCaptainListForMetricsGlobalAndOwn)

router.post("/returnOfInvestment", verifyTokenFnForPro, checkParams, controller.proUser.returnOfInvestment);
router.post("/leadActivities", verifyTokenFnForPro, checkParams, controller.proUser.leadActivities);

module.exports = router;