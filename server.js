const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors());

const { v4: uuidv4 } = require("uuid");
const { generateKeyPair } = require("crypto");

const publicKeysDB = {
  "639cb4ba-7816-484c-84ef-491850a1010f":
    "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnhxt8r2BVs5IwKRVsYoV\nGFwaMoo2RADvsaUv2mP2qkQyFLkHYDbCsZrxn91xjbmUN7ePZU/bEH76y5pZIrjM\nLj8yExfQIqNr5TMiwXyJJvFmsc+hKGEQXoBIfVS+eDDgiVwZAf3YTtOLMKbQ9Wt1\nUhwQd+TspHsPdUlEJN+xEJrm7fkfSv7sogxjxmg2L5QOSsrpZ6ykei1swpAbeq3M\nmpItasy8gJZnZ0Vuw2EE9GEUwApxUH+ZmWL9tPkoaiuDMeLLqX+VCDYxf9TSGwwV\nnHFSA5pcOEYs3YNzkzD65BT9CYfmY42m62oUDChoxslboQ1IR0qliXbnZ3/mxHp7\nJwIDAQAB\n-----END PUBLIC KEY-----\n",
};

// Simulated JWK Set store
let jwkSet = {
  keys: [], // This will store our public keys in JWK format
};

// Middleware to authenticate and verify JWT
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.decode(token, { complete: true });
  if (!decodedToken) {
    return res.status(401).send("Unauthorized: Invalid token");
  }
  const clientId = decodedToken.payload.sub; // Custom claim to identify client
  const publicKey = publicKeysDB[clientId];
  if (!publicKey) {
    return res
      .status(401)
      .send("Unauthorized: Invalid client ID or public key not found");
  }

  try {
    jwt.verify(token, publicKey, { algorithms: ["RS256"] }); // Verify token
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.status(401).send(`Unauthorized: ${error.message}`);
  }
};

// Endpoint to create a new clientId and JWT set
app.post("/create-client", verifyJWT, (req, res) => {
  const clientId = uuidv4(); // Generate a unique client ID

  generateKeyPair(
    "rsa",
    {
      modulusLength: 2048, // Standard RSA key size
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    },
    (err, publicKey, privateKey) => {
      if (err) {
        return res.status(500).send({ error: "Error generating key pair" });
      }

      // Store the keys in the keyStore
      publicKeysDB[clientId] = publicKey;

      const jwk = {
        kty: "RSA",
        e: "AQAB", // base64 encoded
        use: "sig", // signature
        kid: clientId, // Generate a unique identifier for the key
        alg: "RS256",
        n: publicKey.toString("base64"), // Convert the public key to base64 for the 'n' value
      };

      jwkSet.keys.push(jwk);

      res.status(201).send({
        message: "Client created successfully",
        clientId,
        privateKey,
      });
    }
  );
});

// Retrieve the jwk sets
app.get("/jwks", (req, res) => {
  res.status(200).json(jwkSet);
});

// Protected route
app.get("/protected", verifyJWT, (req, res) => {
  res.send("Access to protected data");
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
