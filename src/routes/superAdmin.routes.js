const express = require('express')
var router = express.Router()
var controller = require('../controllers/index')
const { verifyTokenFn } = require('../utils/jwt')
const {uploadLogo} = require('../utils/uploadfiles')

router.post('/login',controller.superAdmin.login)
router.post('/addUser',verifyTokenFn,controller.superAdmin.addUser)
router.get('/usersList',verifyTokenFn,controller.superAdmin.usersList)
router.get('/showUserById',verifyTokenFn,controller.superAdmin.showUserById)
router.get('/companiesList',verifyTokenFn,controller.superAdmin.companiesList)
router.get('/showCompanyById',verifyTokenFn,controller.superAdmin.showCompanyById)
router.post('/upload', uploadLogo.single('image'),controller.superAdmin.upload);

module.exports = router;