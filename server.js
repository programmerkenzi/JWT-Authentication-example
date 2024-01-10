const express = require("express");
const {
  isVerifyToken,
  verifyRefreshToken,
  verifySignature,
  isClientAllowed,
} = require("./utils");
const cors = require("cors");
const NodeRSA = require("node-rsa");
const jwt = require("jsonwebtoken");

const publicKeysDB = {
  "0094f56d15c36a1731e44002b790d5e0":
    "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlPVtFcNqFzHkQAK3kNXg\n71v7f9m1ftnSNsNgqHNXBZbyYishexNYgIrDl9xlgvph9a45JmFD4JZD8AcYtap7\nf58MfrfhX5Cvw/w0lOcphM2K33IrqQtUBh9pvWAx+c5LPuL4gXd8oYV5MvAjnEsn\n+5SHucMTgBoVaZhE6TE5AlRcRzQdFIdutqlf6/SznWWty4DeBDUe0kk5Fhvn+uGb\nISMymM+rmb9Qd8q1Nlumzg2aDmZzLSaOzyAkR9rWyo6UO3FjgIYv9TpmBufN/ERU\n+SRejjSgIvMwoIFN7SRB/up0IHh/P4XM89THQ+NJpE4UfiFSVBP2vt/IMKZfKFUf\nNQIDAQAB\n-----END PUBLIC KEY-----",
};

const app = require("express")();
app.use(express.json());
app.use(cors());
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  console.log(`Handshake`, isVerifyToken(token));

  if (isVerifyToken(token)) {
    console.log("Token verified");
    return next();
  }
  return next(new Error("Authentication error"));
});

app.post("/create-client", (req, res) => {
  const name = req.body.name;
  // Generate a new RSA key pair
  const key = new NodeRSA({ b: 2048 });
  const privateKey = key.exportKey("private");
  const publicKey = key.exportKey("public");
  console.log("Public", publicKey);
  const clientId = key
    .exportKey("components-public")
    .n.toString("hex")
    .substring(0, 32); // Generate a clientId

  publicKeysDB[clientId] = publicKey;
  // Insert the new client and public key into the database
  res.json({ clientId, privateKey, publicKey }); // Send the private key back to the client
});

app.post("/auth", (req, res) => {
  const { clientId, signature } = req.body;
  const publicKey = publicKeysDB[clientId];

  if (!publicKey) return res.status(404).json({ error: "No such client" });

  const dataString = JSON.stringify({ clientId });
  if (verifySignature(dataString, signature, publicKey)) {
    console.log("Signature verified");
    const accessToken = jwt.sign({ clientId }, "JWT_SECRET", {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ clientId }, "REFRESH_SECRET", {
      expiresIn: "7d",
    });

    res.json({ accessToken, refreshToken });
  } else {
    res.status(401).json({ error: "Invalid signature" });
  }
});

app.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;

  // Verify the refresh token and issue a new access token
  // Assuming a function 'verifyRefreshToken(refreshToken)' that returns clientId if valid

  const clientId = verifyRefreshToken(refreshToken); // Replace with actual verification logic

  if (clientId) {
    const newAccessToken = jwt.sign({ clientId }, JWT_SECRET, {
      expiresIn: "15m",
    });
    res.json({ accessToken: newAccessToken });
  } else {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

const clientConnections = new Map();

io.on("connection", (socket) => {
  console.log("websocket server is running");

  socket.on("ice-candidate", async (message) => {
    const data = JSON.parse(message);
    console.log("ICE received", data);
    // Assume `data` contains `senderId` and `receiverId`
    const { senderId, receiverId } = data;

    // Check if the sender is allowed to connect with the receiver
    const isAllowed = await isClientAllowed(senderId, receiverId);
    if (!isAllowed) {
      console.log(
        `Connection from ${senderId} to ${receiverId} is not allowed.`
      );
      return;
    }

    // Find the WebSocket connection of the receiver
    const receiverWs = clientConnections.get(receiverId);
    if (receiverWs) {
      // Relay the ICE candidate to the receiver
      receiverWs.send(
        JSON.stringify({ type: "ice-candidate", candidate: data.candidate })
      );
    }

    // Handle other message types...
  });
});
