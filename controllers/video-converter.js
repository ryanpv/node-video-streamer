const fs = require("fs");
const os = require("os");
const path = require("path");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegStatic);

const videoConverter = async (req, res) => {
  let tmpDir;
  const appPrefix = 'test-app';
  try {
    const inputVal = `./videos/${ req.fileName }`
    // console.time('converter/videos uri');
    console.log("input: ", inputVal)
    // tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix))
    // ffmpeg()
    //   .input(inputVal)
    //   .addOptions([
    //     '-c:v libx264',
    //     '-profile:v baseline',
    //     '-level 3.0',
    //     '-start_number 0',
    //     '-hls_time 6',
    //     '-hls_list_size 0',
    //     '-f hls'
    //   ])
    //   .output("./playlist_files/taxiJapan.m3u8")
    //   .on("error", (error) => {
    //     console.log("error: ", error)
    //   })
    //   .on("progress", (progress) => {
    //     console.log("progress, ", progress.timemark)
    //   })
    //   .on("end", () => {
    //     console.log('ending coversion');
    //     // console.timeEnd('converter/videos uri')
    //   })
    //   .run();
  
      res.send("<a href='/'>Back to home.</a>");
  } catch (error) {
    console.log("some error during conversion: ", error)
  } finally {
    try {
      if (tmpDir) {
        console.log("temp dir at finally: ", tmpDir)
        fs.rmSync(tmpDir, { recursive: true });
      } else {
        console.log("no temp directory")
      }
    } catch (error) {
      console.log (`error occurred removing ${ tmpDir }`, error)
    }
  }
};

module.exports = videoConverter;
