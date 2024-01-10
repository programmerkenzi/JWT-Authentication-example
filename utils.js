const crypto = require("crypto");

function verifySignature(dataString, signature, publicKey) {
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(dataString);
  return verifier.verify(publicKey, signature, "base64");
}

const jwt = require("jsonwebtoken");

const JWT_SECRET = "JWT_SECRET";
const REFRESH_SECRET = "REFRESH_SECRET";
function verifyJWT(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add the decoded token to the request object
    next();
  } catch (ex) {
    res.status(400).json({ error: "Invalid token." });
  }
}

function isVerifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("isVerifyToken", JSON.stringify(decoded));
    return true;
  } catch (ex) {
    console.log("isVerifyToken", JSON.stringify(ex));
    return false;
  }
}

function verifyRefreshToken(req, res, next) {
  const token = req.body.refreshToken;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied. No refresh token provided." });
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    req.user = decoded; // Add the decoded token to the request object
    next();
  } catch (ex) {
    res.status(400).json({ error: "Invalid refresh token." });
  }
}

// Function to check the allow list
async function isClientAllowed(ownerId, clientId, callback) {
  // the logic for get list of allowed clients
  return true;
}

function getClientConnectionInfo(clientId, callback) {
  // In a real application, you would fetch this data from a database
  const connectionInfo = clientConnections[clientId];

  if (connectionInfo) {
    callback(null, connectionInfo);
  } else {
    callback(new Error("Connection info not found"), null);
  }
}

module.exports = {
  verifyJWT,
  verifyRefreshToken,
  verifySignature,
  isClientAllowed,
  getClientConnectionInfo,
  isVerifyToken,
};
