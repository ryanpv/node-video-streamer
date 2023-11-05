const express = require("express");
const cors = require("cors");
const videoConverter = require("./controllers/video-converter");
const storeVideos = require("./controllers/store-videos");
require("dotenv").config({ path: "./config.env"});
const fs = require("fs");
const s3upload = require("./controllers/s3-upload");
const getVideo = require("./controllers/s3-getVideo");
const s3SignedUrl = require("./controllers/getSIgnedUrl");

const app = express();
const PORT = 9191
app.use(cors());
app.use(express.json());

// Middleware to check for hls requests vs regular http requests - used for testing HLS
app.use((req, res, next) => {
  console.log("incoming req: ", req.url)
  if (req.url.includes(".m3u8") && !req.url.includes("redirected") || req.url.includes(".ts") && !req.url.includes("redirected")) {
    console.log("Reached middleware", req.url.split("/redirected")[0])
    res.redirect("/redirected" + req.url)
  } else {
    console.log('reached next');
    next();
  }
});

// Serve HTML to showcase video
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/dist/index.html")
});

// Route to convert to HLS and upload video to S3
app.post("/video-upload", storeVideos, videoConverter, s3upload);

// Route to get signed URL
app.get("/get-signed-video", s3SignedUrl);

// Route to get single file/video WITHOUT signature
app.get("/get-video", getVideo);

// Route to convert media to HLS format
app.get("/convert-video", videoConverter);

// Route to upload to S3
app.get("/uploads3", s3upload)



// TEST ROUTES
app.get("/test-route", (req, res) => {
  console.log("test route hit")
  res.send("<a href='/'>Go to home</a>")
});

// Route to test hls locally
app.get("/redirected/:tokyo", async (req, res) => {
  try {
    const url = req.url.split("/redirected")
    const vidParams = url[url.length - 1]
    const videoPath = (`playlist_files${ vidParams }`)
    console.log("video path: ", videoPath);

    fs.readFile(videoPath, (error, content) => {
      res.writeHead(206, { "Access-Control-Allow-Origin": "*" });
      if (error) {
        console.log("file read error: ", error)
      } else {
        res.end(content, 'utf-8')
      }
    });
  } catch (err) {
    console.log('err here: ', err);
    res.end()
  }
});







app.listen(PORT, () => {
  console.log(`Listening on port=${ PORT }`)
});