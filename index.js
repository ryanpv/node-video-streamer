const express = require("express");
require("dotenv").config({ path: "./config.env"});

const app = express();
const PORT = 9191

app.get("/", (req, res) => {
  res.send("HomePage")
});



app.listen(PORT, () => {
  console.log(`Listening on port=${ PORT }`)
});