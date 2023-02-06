const multer = require('multer')
const path = require('path')

const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/companyLogo')
    },
    filename: function (req, file, cb) {
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname)
    }
})
const uploadLogo = multer({
    storage: storage1
})
//---------------------------------------------------------------------------------------------------------

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatar')
    },
    filename: function (req, file, cb) {
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname)
    }
})
const uploadAvatar = multer({
    storage: storage2
})
//----------------------------------------------------------------------------------------------------
const storage4 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/productImages')
    },
    filename: function (req, file, cb) {
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname)
    }
})
const uploadProductImage = multer({
    storage: storage4
})

//----------------------------------------------------------------------------------------------
const storage3 = multer.diskStorage({
    
    destination:  'uploads',
    filename: function (req, file, cb) {
        let x= file.originalname.split(".")
        let fileName = x[0]
        let ext = path.extname(file.originalname);
        cb(null, `${fileName}-${Date.now()}${ext}`)
    }
})
const uploadProductFile = multer({
    storage: storage3,
    fileFilter: function(req,file, cb){
        checkFileType(file, cb);
    }
})
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /csv/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
        cb('Error: CSV Only!');
    }
}

const storage5 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/mailAttachments')
    },
    filename: function (req, file, cb) {
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname)
    }
})
const uploadMailAttechments = multer({
    storage: storage5
})

const storage6 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/salesContract')
    },
    filename: function (req, file, cb) {
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname)
    }
})
const uploadSalesContract = multer({
    storage: storage6
})

const storage7 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/salesInvoice')
    },
    filename: function (req, file, cb) {
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname)
    }
})
const uploadSalesInvoice = multer({
    storage: storage7
})


module.exports = { 
    uploadLogo, 
    uploadAvatar, 
    uploadProductFile, 
    uploadProductImage, 
    uploadMailAttechments,
    uploadSalesContract,
    uploadSalesInvoice
 };