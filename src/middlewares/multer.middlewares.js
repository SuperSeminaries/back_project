import multer  from "multer"
import fs from 'fs'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = "public/tmp"
        if(!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, {recursive: true})
        }
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({ storage: storage })