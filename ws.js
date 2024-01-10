const { isClientAllowed, verifyJWT } = require("./utils");
const WebSocket = require("ws");

const wss = new WebSocket.Server({ noServer: true });

let clientConnections = new Map();

wss.on("listening", () => {
  console.log("wss listening");
});

wss.on("upgrade", (request, socket, head) => {
  // Extract the token from the request
  const token = request.headers["sec-websocket-protocol"];
  console.log("wss auth", token);
  const isVerify = verifyJWT(token);
  // Extract token from request headers and verify
  if (isVerify) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);

      // When a new WebSocket connection is established
      clientConnections.set(isVerify.clientId, ws);
    });
  } else {
    socket.destroy(); // Close the connection if the token is invalid
  }
});

wss.on("connection", (ws, req) => {
  console.log("websocket server is running");
  ws.on("message", async (message) => {
    const data = JSON.parse(message);

    if (data.type === "ice-candidate" && data.candidate) {
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
    }

    // Handle other message types...
  });
});

module.exports = wss;
