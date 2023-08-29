const multer = require("multer");
const multerStore = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "videos")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
});
const upload = multer({ storage: multerStore });

const storeVideos = (req, res) => {
  // "file" is from the name property from the multipart form
  upload.single("file")

};

module.exports = storeVideos;