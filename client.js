const socket = io();

let peerConnection;
const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

// Start signaling
socket.on("signal", async (data) => {
    if (data.sdp) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === "offer") {
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit("signal", { sdp: answer });
        }
    } else if (data.ice) {
        await peerConnection.addIceCandidate(data.ice);
    }
});

peerConnection = new RTCPeerConnection(config);

peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        socket.emit("signal", { ice: event.candidate });
    }
};

// Data channel for messages
const dataChannel = peerConnection.createDataChannel("chat");

dataChannel.onopen = () => {
    console.log("Connection opened");
};

dataChannel.onmessage = (event) => {
    document.getElementById("chat").value += "Peer: " + event.data + "\n";
};

// Start the offer
(async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("signal", { sdp: offer });
})();

function sendMessage() {
    const message = document.getElementById("message").value;
    document.getElementById("chat").value += "You: " + message + "\n";
    dataChannel.send(message);
    document.getElementById("message").value = "";
}