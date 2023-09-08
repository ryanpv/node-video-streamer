const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const fs = require("fs");
const path = require("path");

const s3upload = async (req, res) => {
  try {
    fs.readdir("./playlist_files", (err, files) => {
      if (err) {
        console.log("readdir error: ", err);
        process.exit(1)
      }

      files.forEach(async (file) => {
        console.log("file: ", file)
        const uploadFile = new Upload({
          client: new S3Client,
          params: {
            Bucket: process.env.S3_BUCKET,
            Key: `${ file }`,
            Body: fs.createReadStream("./playlist_files/" + file),
            ContentType: path.extname(file) === ".ts" ? "video/MP2T" : "application/x-mpegURL",
          },
          tags: [],
          leavePartsOnError: false,
        });

        uploadFile.on("httpUploadProgress", (progress) => {
          console.log("progress: ", progress);
        });

        await uploadFile.done();
      });
    });
      res.send("<a href='/'>Back to home.</a>");
  } catch (error) {
    console.log("Error with s3 upload", error)
  }
};

module.exports = s3upload;

