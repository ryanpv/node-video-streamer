const express = require("express");
const videoConverter = require("./controllers/video-converter");
const storeVideos = require("./controllers/store-videos");
require("dotenv").config({ path: "./config.env"});

const app = express();
const PORT = 9191

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
});

app.get("/test-route", (req, res) => {
  console.log("test route hit")
  res.send("<a href='/'>Go to home</a>")
})

app.post("/video-upload", storeVideos, videoConverter);

app.get("/convert-video", videoConverter);





app.listen(PORT, () => {
  console.log(`Listening on port=${ PORT }`)
});