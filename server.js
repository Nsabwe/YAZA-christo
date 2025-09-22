const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("signal", (data) => {
        socket.broadcast.emit("signal", data); // send signal to all peers
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

http.listen(3000, () => {
    console.log("Server listening on http://localhost:3000");
});