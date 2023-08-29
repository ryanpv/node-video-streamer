const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const fs = require("fs");

const s3upload = async (req, res) => {
  try {
    fs.readdir("/server/videos", (err, files) => {
      if (err) {
        console.log("readdir error: ", err);
        process.exit(1)
      }

      files.forEach(async (file) => {
        const uploadFile = new Upload({
          client: new S3Client,
          params: {
            Bucket: process.env.S3_BUCKET,
            Key: `${ file }-key`,
            Body: file,
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
  } catch (error) {
    console.log("Error with s3 upload", error)
  }
}

