const fs = require("fs");
// Library to be able to stream from a buffer
const streamifier = require("streamifier");
const os = require("os");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
ffmpeg.setFfmpegPath(ffmpegStatic);

const videoConverter = async (req, res, next) => {
  try {
    // Temp check for if file is not received from client
    if (!req.file) {
      res.status(400).send("400 BAD REQUEST. No file received at server. <a href='/'>Back to home.</a>")
    }
    // Stream the file data as buffer into the created temp dir
    // Writes to ffmpeg input location
    const writeStream = fs.createWriteStream(`${ req.tempDir }/${ req.file.originalname }`);

    // Streamifier library to be able to stream the file buffer, which is stored in memory by multer library
    streamifier.createReadStream(req.file.buffer).pipe(writeStream)

    // mkdtempSync() to create temp dir to store media conversion output
    const tempOutputDirPrefix = "ffmpegTempDir-";
    let tempOutputDir = fs.mkdtempSync(path.join(os.tmpdir(), tempOutputDirPrefix));
    req.tempOutputDir = tempOutputDir

    // Video conversion to HLS
    const convertVideo = new Promise((resolve, reject) => {
        ffmpeg()
          .input(`${ req.tempDir }/${ req.file.originalname }`)
          .addOptions([
            '-c:v libx264',
            '-profile:v baseline',
            '-level 3.0',
            '-start_number 0', // media timestamp to start the conversion
            '-hls_time 6', // segment size - approximate only
            '-hls_list_size 0',
            '-f hls' // format
          ])
          .output(`${ tempOutputDir }/testUser_${ req.file.originalname}.m3u8`)
          .on("error", (error) => {
            console.log("error: ", error)
            reject(error)
          })
          .on("progress", (progress) => {
            console.log("progress, ", progress.timemark)
          })
          .on("end", () => {
            console.log('Media conversion has ended.');
            resolve('conversion has ended.');
          })
          .run()
    });

    // Removes temp directory that holds client upload pre-conversion once video conversion promise is resolved
    convertVideo.then(() => {
      if (req.tempDir) {
        // Delete temp dir for initial client media file upload
        fs.rmSync(req.tempDir, { recursive: true });
      } else {
        console.log("no temp dir found");
      }
      next();
    });
    
  } catch (error) {
    console.log("some error during conversion: ", error)
  } 
};

module.exports = videoConverter;
