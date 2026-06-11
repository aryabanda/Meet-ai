const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const meetingRoutes = require("./routes/meeting");

const app = express();
const roomUsers = {};


/* Middleware */
app.use(cors());
app.use(express.json());

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Meet AI Backend Running"
  });
});

/* Create HTTP Server */
const server = http.createServer(app);

/* Socket.IO */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* Helper Function */
function updateParticipants(meetingId) {

  const room =
    io.sockets.adapter.rooms.get(
      meetingId
    );

  const participants =
    room
      ? Array.from(room).map(
          (socketId) => {

            const client =
              io.sockets.sockets.get(
                socketId
              );

            return {
              id: socketId,
              username:
                client?.username ||
                "Unknown"
            };

          }
        )
      : [];

  io.to(meetingId).emit(
    "participants-update",
    participants
  );

}

/* Socket Events */
io.on("connection", (socket) => {

  

  console.log(
    "User Connected:",
    socket.id
  );

  socket.emit(
    "welcome",
    "Connected Successfully"
  );

  /* Join Room */
  socket.on(
  "join-room",
  ({
    meetingId,
    username,
    userId
  }) => {

    socket.username =
      username;

    socket.userId =
      userId;

    socket.meetingId =
      meetingId;

    socket.join(meetingId);

    if (
      !roomUsers[meetingId]
    ) {

      roomUsers[meetingId] = {};

    }

    roomUsers[meetingId][userId] = {
      username,
      socketId: socket.id
    };

    const participants =
      Object.entries(
        roomUsers[meetingId]
      ).map(
        ([userId, data]) => ({
          userId,
          username:
            data.username,
          socketId:
            data.socketId
        })
      );

    io.to(meetingId).emit(
      "participants-update",
      participants
    );

    console.log(
      "JOIN DATA:",
      {
        username,
        userId,
        socketId: socket.id
      }
    );

  }
);

  socket.on(
  "start-meeting",
  (meetingId) => {

    io.to(meetingId).emit(
      "meeting-started"
    );

  }
);
socket.on(
  "call-started",
  (meetingId) => {

    io.to(meetingId).emit(
      "call-started"
    );

  }
);
  /* Leave Room */
 socket.on(
  "leave-room",
  () => {

    console.log(
      `${socket.username} left room`
    );

  }
);

  /* WebRTC Offer */
socket.on(
  "offer",
  ({ offer, target }) => {

    io.to(target).emit(
      "offer",
      {
        offer,
        sender: socket.id
      }
    );

  }
);

/* WebRTC Answer */
socket.on(
  "answer",
  ({ answer, target }) => {

    io.to(target).emit(
      "answer",
      {
        answer,
        sender: socket.id
      }
    );

  }
);

/* ICE Candidate */
socket.on(
  "ice-candidate",
  ({ candidate, target }) => {

    io.to(target).emit(
      "ice-candidate",
      {
        candidate,
        sender: socket.id
      }
    );

  }
);

  /* Disconnect */
socket.on(
  "disconnect",
  () => {

    console.log(
      "User Disconnected:",
      socket.username
    );

    setTimeout(() => {

      const room =
        roomUsers[
          socket.meetingId
        ];

      if (
        room &&
        room[socket.userId] &&
        room[socket.userId]
          .socketId === socket.id
      ) {

        delete room[
          socket.userId
        ];

        const participants =
          Object.entries(room)
            .map(
              ([userId, data]) => ({
                userId,
                username:
                  data.username,
                socketId:
                  data.socketId
              })
            );

        io.to(
          socket.meetingId
        ).emit(
          "participants-update",
          participants
        );

      }

    }, 5000);

  }
);
  

});

/* Start Server */
const PORT =
  process.env.PORT || 5000;

server.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );

  }
);