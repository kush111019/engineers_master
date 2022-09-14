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
router.get('/companyWiseTotalRevenue', verifyTokenFn, controller.superAdmin.companyWiseTotalRevenue)
router.get('/userWiseCompanyRevenue', verifyTokenFn, controller.superAdmin.userWiseCompanyRevenue)
router.get('/dashboard', verifyTokenFn, controller.superAdmin.dashboard)



module.exports = router;