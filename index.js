const express = require("express");
const axios = require('axios');

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to Shopping");
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ---${port}`);
});
