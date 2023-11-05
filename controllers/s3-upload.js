const { S3Client } = require("@aws-sdk/client-s3");
// Upload from lib-storage instead of PutObjectCommand for multi-part/stream upload. Can be better performance for larger files
const { Upload } = require("@aws-sdk/lib-storage");
const fs = require("fs");
const path = require("path");

const s3upload = async (req, res) => {
  try {
    // Read temp dir that holds the converted media files
    fs.readdir(req.tempOutputDir, (err, files) => {
      if (err) {
        console.log("readdir error: ", err);
        process.exit(1)
      };

      // Promise to upload HLS files to S3
      const mediaUpload = new Promise ((resolve, reject) => {
        if (!files) reject("Error with directory.");

        // Loop through temp directory to upload manifest file and each related .ts segment file
        files.forEach(async (file) => {
          const uploadFile = new Upload({
            client: new S3Client,
            params: {
              Bucket: process.env.S3_BUCKET,
              Key: `lambda_test/${ file }`,
              Body: fs.createReadStream(req.tempOutputDir + "/" + file),
              ContentType: path.extname(file) === ".ts" ? "video/MP2T" : "application/x-mpegURL",
            },
            tags: [],
            leavePartsOnError: false,
          });
  
          uploadFile.on("httpUploadProgress", (progress) => {
            console.log("httpUploadProgress: ", progress);
          });

          await uploadFile.done();
          resolve("Upload to S3 bucket complete");
        });
      });

      // Remove temp dir that holds converted files after upload promise complete
      mediaUpload.then(() => {
        if (req.tempOutputDir) {
          // Delete temp dir for converted media files
          fs.rmSync(req.tempOutputDir, { recursive: true });
        } else {
          console.log("no temp dir found");
        }
      });
    });

    res.send("<a href='/'>Back to home.</a>");
  } catch (error) {
    console.log("Error with s3 upload", error)
  }
};

module.exports = s3upload;

