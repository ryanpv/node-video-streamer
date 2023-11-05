const multer = require("multer");
const fs = require("fs");
const os = require("os");
const path = require("path");

const storeVideos = async (req, res, next) => {
  // Uses memory instead of disk
  const multerStore = multer.memoryStorage()
  // Accepts single file, which is stored in req.file
  const upload = multer({ storage: multerStore }).single("file"); 
  const clientUploadTempDir = "client-upload"

  // Make temp dir synchronously for client's media upload
  let tempDir = fs.mkdtempSync(path.join(os.tmpdir(), clientUploadTempDir))
  req.tempDir = tempDir

  // Call multer method to store the file in memory (temp directory)
  upload(req, res, (err) => {
    if (err) {
      console.log("multer err: ", err)
    }
    // next must be called inside upload otherwise it will run before req.fileName is set
    return next(); 
  });
};

module.exports = storeVideos;