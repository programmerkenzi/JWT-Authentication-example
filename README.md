# JWT Authentication Project

This project demonstrates a basic implementation of JWT (JSON Web Token) creation and validation using Node.js and Express. It consists of two main parts: a client script that generates JWTs and a server script that validates the JWT signatures.

## Structure

- `client.js`: Handles the generation of JWTs using a private key.
- `server.js`: An Express server that validates JWT signatures using a corresponding public key.

## Setup

To run this project, you need Node.js installed on your system. After cloning the repository, install the necessary dependencies.

```bash
npm install
```

## Running the Server

The server script sets up an Express server that listens for incoming requests with JWTs. It validates the JWT signature using a public key. To start the server, use the following command:

```bash
npm run server
```

The server will start and listen for requests on the defined port (default is 3000).

## Running the Client

The client script generates a JWT and sends it to the server. To run the client script, use the following command:

```bash
npm run client
```

The client will generate a JWT and send a request to the server.

## Implementation Details

Client (client.js)
Generates a JWT with a specified payload and signs it using an RSA private key.
Sends the JWT to the server in an HTTP request.
Server (server.js)
An Express server that listens for incoming requests.
Extracts the JWT from the request header.
Validates the JWT signature using the corresponding RSA public key.
If the signature is valid, it responds with success; otherwise, it responds with an error.
Security Notes

The private key used for signing JWTs should be kept secure and not exposed.
This example is for demonstration purposes and may need modifications for production use.
