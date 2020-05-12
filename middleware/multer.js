var multer = require('multer');

module.exports =multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            cb(new Error('Only image files are allowed!'), false);
            return
        }
        cb(null, true);
    }
    ,
    filename: function (req, file, callback) 
  
  { callback(null, Date.now()+file.originalname);}
//   { callback(null, file.fieldname +'-' + Date.now()+file.originalname);}
//   { callback(null, file.fieldname +'-' + Date.now()+path.extname(file.originalname));}

})