const { io } = require("socket.io-client");

function connectWebSocketWithToken(token) {
  console.log("socket connecting...");
  const socket = io("http://localhost:3000", {
    query: {
      token: token,
    },
  });

  socket.on("connect", () => {
    console.log("socket connection established.", socket.id); // x8WIv7-mJelg7on_ALbx
  });
  socket.on("disconnect", () => {
    console.log(socket.id); // undefined
  });
  global.io = socket;
}

function initializeWebRTC(receiverId) {
  console.log("initializing RTCPeerConnection");
  global.io.emit(
    "ice-candidate",
    JSON.stringify({
      type: "ice-candidate",
      candidate: "testFlow",
      receiverId: receiverId, // Include the receiver's ID
    })
  );
  let localConnection = new RTCPeerConnection();

  // Send any ICE candidates to the server
  localConnection.onicecandidate = (event) => {
    if (event.candidate) {
      global.io.emit(
        "ice-candidate",
        JSON.stringify({
          type: "ice-candidate",
          candidate: event.candidate,
          receiverId: receiverId, // Include the receiver's ID
        })
      );
    }
  };

  // Let the "negotiationneeded" event signal the offer creation
  localConnection.onnegotiationneeded = async () => {
    let offer = await localConnection.createOffer();
    await localConnection.setLocalDescription(offer);
    global.io.send(
      JSON.stringify({
        type: "offer",
        offer: offer,
        receiverId: receiverId, // Include the receiver's ID
      })
    );
  };

  // Handle messages from the WebSocket server
  global.io.onmessage = async (message) => {
    let data = JSON.parse(message.data);

    if (data.type === "offer") {
      await localConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      let answer = await localConnection.createAnswer();
      await localConnection.setLocalDescription(answer);
      global.io.send(
        JSON.stringify({
          type: "answer",
          answer: answer,
          receiverId: data.senderId, // Respond back to the sender
        })
      );
    } else if (data.type === "answer") {
      await localConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    } else if (data.type === "ice-candidate" && data.candidate) {
      await localConnection.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    }
  };
}

module.exports = { connectWebSocketWithToken, initializeWebRTC };
