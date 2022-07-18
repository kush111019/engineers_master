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

const storage3 = multer.diskStorage({
    
    destination:  'uploads',
    filename: function (req, file, cb) {
        let x= file.originalname.split(".")
        let fileName = x[0]
        let ext = path.extname(file.originalname);
        cb(null, `${fileName}-${Date.now()}${ext}`)
    }
})
const uploadLeadFile = multer({
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
        cb('Error: Images Only!');
    }
  }

module.exports = { uploadLogo, uploadAvatar, uploadLeadFile };