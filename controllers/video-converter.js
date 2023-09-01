const fs = require("fs");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegStatic);

const videoConverter = (req, res) => {
  const inputVal = `./videos/${ req.fileName }`
  // console.time('converter/videos uri');
  console.log("input: ", inputVal)

  ffmpeg()
    .input(inputVal)
    .addOptions([
      '-c:v libx264',
      '-profile:v baseline',
      '-level 3.0',
      '-start_number 0',
      '-hls_time 6',
      '-hls_list_size 0',
      '-f hls'
    ])
    .output("./playlist_files/taxiJapan.m3u8")
    .on("error", (error) => {
      console.log("error: ", error)
    })
    .on("progress", (progress) => {
      console.log("progress, ", progress.timemark)
    })
    .on("end", () => {
      console.log('ending coversion');
      // console.timeEnd('converter/videos uri')
    })
    .run();

    res.send("<a href='/'>Back to home.</a>");
};

module.exports = videoConverter;
