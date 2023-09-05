const express = require("express");
const videoConverter = require("./controllers/video-converter");
const storeVideos = require("./controllers/store-videos");
require("dotenv").config({ path: "./config.env"});
const fs = require("fs");

const app = express();
const PORT = 9191

// app.use((req, res, next) => {
//   if (req.url.includes(".m3u8") || req.url.includes(".ts")) {
//     console.log("Reached middleware", req.url)
//     // res.redirect("/redirected/" + req.url)
//   } else {
//     console.log("Did not reach proper destination", req.url)
//   }
//   next();
// });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
});

app.get("/test-route", (req, res) => {
  console.log("test route hit")
  res.send("<a href='/'>Go to home</a>")
})

// app.get("/:video", async (req, res) => {
//   const videoPath = `playlist_files/${ req.url }`

//   fs.readFile(videoPath, (error, content) => {
//     res.writeHead(206, { "Access-Control-Allow-Origin": "*" });
//     if (error) {
//       console.log("readFile error");
//       res.send(error)
//     } else {
//       res.end(content, 'utf-8')
//     }
//   });

// })

app.post("/video-upload", storeVideos, videoConverter);

app.get("/convert-video", videoConverter);





app.listen(PORT, () => {
  console.log(`Listening on port=${ PORT }`)
});