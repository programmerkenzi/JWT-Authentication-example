const express = require("express");
const cors = require("cors");
const { getTokens } = require("./auth");
const app = express();

const port = process.env.PORT;

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

setTimeout(() => getTokens(), 3000);

// Start the client
