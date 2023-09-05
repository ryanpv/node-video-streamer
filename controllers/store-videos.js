const multer = require("multer");
const fs = require("fs");
const os = require("os");
const path = require("path");

const storeVideos = async (req, res, next) => {
  const multerStore = multer.memoryStorage()
  const upload = multer({ storage: multerStore }).single("file");
  const appPrefix = "testing-temp";
  let tempDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix))
  req.tempDir = tempDir

  upload(req, res, (err) => {
    if (err) {
      console.log("multer err: ", err)
    }
    return next(); // next must be called inside upload otherwise it will run before req.fileName is set
  });
};

module.exports = storeVideos;