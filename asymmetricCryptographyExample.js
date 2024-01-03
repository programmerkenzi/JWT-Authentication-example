const NodeRSA = require("node-rsa");

// Generate a new RSA key pair
const key = new NodeRSA({ b: 512 }); // 512-bit key

// Extract the public key
const publicKey = key.exportKey("public");

// Extract the private key
const privateKey = key.exportKey("private");

// Sample message to encrypt
const message = "Hello, Asymmetric Cryptography!";

// Encrypt the message with the public key
const encrypted = key.encrypt(message, "base64");
console.log("Encrypted:", encrypted);

// Create a new NodeRSA instance for decryption
const decryptKey = new NodeRSA(privateKey);

// Decrypt the message with the private key
const decrypted = decryptKey.decrypt(encrypted, "utf8");
console.log("Decrypted:", decrypted);
