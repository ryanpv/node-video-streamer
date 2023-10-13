const fs = require("fs");
const streamifier = require("streamifier");
const os = require("os");
const path = require("path");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegStatic);

const videoConverter = async (req, res, next) => {
  try {
    const writeStream = fs.createWriteStream(`${ req.tempDir }/${ req.file.originalname }`)
    streamifier.createReadStream(req.file.buffer).pipe(writeStream)

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
          .output(`./playlist_files/user1_${ req.file.originalname }.m3u8`) // output direct upload to s3???
          .on("error", (error) => {
            console.log("error: ", error)
            reject(error)
          })
          .on("progress", (progress) => {
            console.log("progress, ", progress.timemark)
          })
          .on("end", () => {
            console.log('conversion has ended.');
            // console.timeEnd('converter/videos uri')
            resolve('conversion has ended.');
          })
          .run()
    });

    convertVideo.then(() => {
      if (req.tempDir) {
        fs.rmSync(req.tempDir, { recursive: true });
      } else {
        console.log("no temp dir found");
      }
      next();
    })
    
      // res.send("<a href='/'>Back to home.</a>");
  } catch (error) {
    console.log("some error during conversion: ", error)
  } 
};

module.exports = videoConverter;
