const express = require("express");
const cors = require("cors");
const { testFlow } = require("./auth");
const app = express();

const port = process.env.PORT;

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

setTimeout(() => testFlow(), 3000);
