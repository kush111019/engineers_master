const express = require('express')
var router = express.Router()
var controller = require('../controllers/index')
const { verifyTokenFn } = require('../utils/jwt')
const {uploadAvatar} = require('../utils/uploadfiles')


router.post('/setPassword',controller.users.setPasswordForLogin)
router.post('/login',controller.users.login)
router.post('/upload',verifyTokenFn, uploadAvatar.single('image'),controller.users.upload);
router.get('/showProfile',verifyTokenFn, controller.users.showProfile)
router.put('/updateUserProfile',verifyTokenFn, controller.users.updateUserProfile)
router.put('/changePassword',verifyTokenFn, controller.users.changePassword)
router.post('/forgotPassword',controller.users.forgotPassword)
router.post('/resetPassword',controller.users.resetPassword)



module.exports = router;