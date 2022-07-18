const express = require('express');
const controller = require('../controllers');
const router = express.Router();
const {uploadLogo} = require('../utils/uploadfiles')



router.use('/superAdmin', require('./superAdmin.routes'))
router.use('/user', require('./user.routes'))
router.use('/companyAdmin', require('./companyAdmin.routes'))

router.post('/auth/upload',uploadLogo.single('image'),controller.companyAdmin.uploadLogo);
router.post('/auth/signUp' , controller.companyAdmin.signUp)
router.post('/auth/login' , controller.companyAdmin.login)
router.post('/auth/setPassword',controller.companyAdmin.setPasswordForLogin)


module.exports = router;