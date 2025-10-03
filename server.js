const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // React app URL
    methods: ["GET", "POST"],
  },
});


const chatData = [
  { room: "Chat Room", messages: [] }
];

function addChat(data) {

  chatData.forEach(element => {
    if (element.room === data.room) {
      element.messages.push({message: data.message , room : data.room , username : data.username} );
    }
  });


  console.log("append data : ", data);
  
}

app.get("/get-messages", (req, res) => {

  console.log("api send data : ", chatData[0].messages);
  res.json( chatData[0].messages  );
});



io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Join a room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Send message inside a room
  socket.on("send_message", (data) => {

    console.log("data : ", data);
    
    addChat(data);
    console.log(`[${data.room}] ${data.username}: ${data.message}`);

    // Send only to clients in the same room
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
