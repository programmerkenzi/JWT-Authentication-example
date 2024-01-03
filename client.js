const jwt = require("jsonwebtoken");
const fs = require("fs");

// Actual clientId provided by your server
const clientId = "639cb4ba-7816-484c-84ef-491850a1010f";

// Replace with the path to your RSA private key file
const pathToPrivateKey =
  "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCeHG3yvYFWzkjA\npFWxihUYXBoyijZEAO+xpS/aY/aqRDIUuQdgNsKxmvGf3XGNuZQ3t49lT9sQfvrL\nmlkiuMwuPzITF9Aio2vlMyLBfIkm8Waxz6EoYRBegEh9VL54MOCJXBkB/dhO04sw\nptD1a3VSHBB35Oykew91SUQk37EQmubt+R9K/uyiDGPGaDYvlA5KyulnrKR6LWzC\nkBt6rcyaki1qzLyAlmdnRW7DYQT0YRTACnFQf5mZYv20+ShqK4Mx4supf5UINjF/\n1NIbDBWccVIDmlw4Rizdg3OTMPrkFP0Jh+ZjjabrahQMKGjGyVuhDUhHSqWJdudn\nf+bEensnAgMBAAECggEBAIFE4SfLhInCUn0eXumu6ZxnAQw9MCzdTxvA4KT/gdan\ntwJ2XO9vFjM7aT25QXQMPIBpVZYRehu8lbQNV78ps9ZD2N7/Yy5OypI0AsCK31+1\nkq7iAPMQmN+KprnBpZCC9bGYWOHl9wpLrstyN/nPh7ZAN76urkO0UWklI8+6C/x0\nQDFTDOKvsSTMmkzBnZevdleOHnEovytIP6pxBWKf/eZaSn67TsU6Woa7SVc98LX1\nNi4QdEdWvIjU9qpxuEkuyx5iWHwiX4cQQUNxaeL1xcb04uckfmoacbdpc047PzHr\nUbNp19bAAe7XMM/JQ0OxpiQM41dHeb+64gPIru8YXJECgYEAzkGxu0qkCwWsUlD7\nFauulkmAu8V3ESCFbc6ByBjw99odhfi/p5D+xF1VPvMqZ4uBQaY2St9TfmVZF14c\nTra8EZ2DJGnKQE9CQOore5HdBsw8veilS8Yl74LziDjoqc0v16W99wS1hBrYk+uU\nPBXaEhe5myiMMTwgDfyCStx40dMCgYEAxD45DAGrv/a5Jfyi4mEl0KVkj5SWS1Sm\n5u16gPaE19sMLimyvMZYfHBuTJnzjhLbRosxBwjIonjlysjDBL5wI8h2g+38bNLx\n2uoPvzk8Khcy/jV3i8Zt9uvWb2QwWEnmTdgUrmtVgA1/gl49YJ7VE9OieS94vg4K\ne74hGDHuSN0CgYA5LymRnb4heC8wm1chyPmcnUBdzv+V9ghIS2rcCV41uXlZ/X9V\ne/PGiYHq9AwbrSfnBagj1gsWDg9HVUZP5IX79Em5vMLgVZku2j24Atbe3Z0xoeDC\nQ2udHhda+zw2Z7cN+NvUMrAIslC9oiD1D7HoNj+1buZ/eAYDGrEdBEdTFQKBgQCa\nZL3rFVFz2P+3xDi+VGI08jrYv7UzFSmum337Anhnfx3pH8NQw9gQJ0CQIbs9ttYv\nfQkYmK+JLAbWcPcFv3JopKmhiFZFo/zGF8pFzxjnoJLs71HbdUVEtC1kO/XRMGry\nKaOzyhxdf8Em50/wuWW4kJPONiwPkupqip5s87OePQKBgDBZWJvpIEreGODetLT7\nTN2NS//UK1Xct4yREFhVdPyBB6K2bWmufGijd5DASQ/N0EzK+p7c+6A1fQNOZ2av\nm97Q8VyXvqMnD3gHkdJ0oc+JdVXliGrCTcTmWB+LW+tkg+CJzpo19DCrJM71qniI\nCNB5Mq/hvD6Ib+GaK5EmT/Yy\n-----END PRIVATE KEY-----\n";

// Generate JWT with payload containing the clientId
function generateJWT() {
  const payload = {
    // Registered claim for subject, which can be the clientId
    sub: clientId,
    // Additional claims can be added as needed
    // ...
  };

  // Sign the token with RS256 algorithm
  const token = jwt.sign(payload, pathToPrivateKey, {
    algorithm: "RS256",
    expiresIn: "1h",
  });

  return token;
}

// Generated JWT
const token = generateJWT();
console.log("Generated JWT:", token);

// Example usage: Send the JWT in an HTTP Authorization header using axios
const axios = require("axios");

async function sendTokenToServer(token) {
  try {
    const response = await axios.get("http://localhost:3000/protected", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Server response:", response.data);
  } catch (error) {
    console.error("Error communicating with the server:", error);
  }
}

sendTokenToServer(token);
