const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegStatic);

const videoConverter = (req, res) => {
  const inputVal = "videos/taxi-japan-1080p.mp4"
  console.time('converter/videos uri');
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
    .output("thread_output/taxiJapan.m3u8")
    .on("error", (error) => {
      console.log("error: ", error)
    })
    .on("progress", (progress) => {
      console.log("progress, ", progress.timemark)
    })
    .on("end", () => {
      console.log('ending coversion');
      console.timeEnd('converter/videos uri')
    })
    .run();
};

module.exports = videoConverter;
