const express = require("express");
const videoConverter = require("./controllers/video-converter");
const storeVideos = require("./controllers/store-videos");
require("dotenv").config({ path: "./config.env"});
const fs = require("fs");
const s3upload = require("./controllers/s3-upload");
const getVideo = require("./controllers/s3-getVideo");
const s3SignedUrl = require("./controllers/getSIgnedUrl");

const app = express();
const PORT = 9191
app.use(express.json());

// Middleware to check for hls requests vs regular http requests
app.use((req, res, next) => {
  if (req.url.includes(".m3u8") && !req.url.includes("redirected") || req.url.includes(".ts") && !req.url.includes("redirected")) {
    console.log("Reached middleware", req.url.split("/redirected")[0])
    res.redirect("/redirected" + req.url)
  } else {
    console.log('reached next');
    next();

  }
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
});

app.get("/getVideo", getVideo)
app.get("/get-file", s3SignedUrl)


app.get("/test-route", (req, res) => {
  console.log("test route hit")
  res.send("<a href='/'>Go to home</a>")
})


// Route to test hls locally
app.get("/redirected/:tokyo", async (req, res) => {
  // if (!req.url.includes(".ts") || !req.url.includes(".m3u8")) {
  //   res.end()
  // };
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

app.post("/video-upload", storeVideos, videoConverter, s3upload);

app.get("/convert-video", videoConverter);

app.get("/uploads3", s3upload)





app.listen(PORT, () => {
  console.log(`Listening on port=${ PORT }`)
});