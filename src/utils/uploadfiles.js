const multer = require('multer')
const path = require('path')

const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/companyLogo')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
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
        const ext = file.mimetype.split('/')[1];
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
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
        const ext = file.mimetype.split('/')[1];
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
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
        const ext = file.mimetype.split('/')[1];
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
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
        const ext = file.mimetype.split('/')[1];
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
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
        const ext = file.mimetype.split('/')[1];
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})
const uploadSalesInvoice = multer({
    storage: storage7
})


const storage8 = multer.diskStorage({
    
    destination:  'uploads',
    filename: function (req, file, cb) {
        let x= file.originalname.split(".")
        let fileName = x[0]
        let ext = path.extname(file.originalname);
        cb(null, `${fileName}-${Date.now()}${ext}`)
    }
})
const uploadLeadsFile = multer({
    storage: storage8,
    fileFilter: function(req,file, cb){
        checkFileType(file, cb);
    }
})

const storage9 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/playBookProduct')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})
const uploadPlayBookProduct = multer({
    storage: storage9
})

const storage10 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/playBookVision')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileName = `${Date.now()}.${ext}`
        cb(null, fileName)
    }
})
const uploadPlayBookVision = multer({
    storage: storage10
})



module.exports = { 
    uploadLogo, 
    uploadAvatar, 
    uploadProductFile, 
    uploadProductImage, 
    uploadMailAttechments,
    uploadSalesContract,
    uploadSalesInvoice,
    uploadLeadsFile,
    uploadPlayBookProduct,
    uploadPlayBookVision
 };