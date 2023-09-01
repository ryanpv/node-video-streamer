const multer = require("multer");

const storeVideos = (req, res, next) => {
  const multerStore = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "videos")
    },
    filename: (req, file, cb) => {
      req.fileName = file.originalname // store file name to send to converter route
      cb(null, file.originalname)
    }
  });
  const upload = multer({ storage: multerStore }).single("file");
  // "file" is from the name property from the multipart form

  upload(req, res, (err) => {
    if (err) {
      console.log("multer err: ", err)
    }

    next(); // next must be called inside upload otherwise it will run before req.fileName is set
  });
};

module.exports = storeVideos;