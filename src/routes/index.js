const express = require('express');
const controller = require('../controllers');
const router = express.Router();
const {uploadLogo} = require('../utils/uploadfiles')
const { verifyTokenFn } = require('../utils/jwt')
const {checkParams} = require('../utils/helper')


router.use('/superAdmin', require('./superAdmin.routes'))
router.use('/companyAdmin', require('./companyAdmin.routes'))
router.use('/proUser', require('./proUser.routes'))

router.post('/auth/upload',uploadLogo.single('image'),checkParams,controller.companyAdmin.uploadLogo);
router.post('/auth/signUp' , checkParams,controller.companyAdmin.signUp)
router.post('/auth/verifyUser' , checkParams,controller.companyAdmin.verifyUser)
router.post('/auth/login' , checkParams,controller.companyAdmin.login)
router.post('/auth/setPassword',checkParams,controller.companyAdmin.setPasswordForLogin)
router.post('/auth/forgotPassword',checkParams,controller.companyAdmin.forgotPassword)
router.post('/auth/resetPassword',checkParams,controller.companyAdmin.resetPassword)
router.post('/auth/proUserLogin',checkParams,controller.proUser.proUserLogin)
router.post('/auth/contactUs', checkParams,controller.contactUs.contactUs)

router.get('/plansList',checkParams,controller.payment.plansList)

router.get('/countryDetails',verifyTokenFn, checkParams,controller.companyAdmin.countryDetails)


module.exports = router;