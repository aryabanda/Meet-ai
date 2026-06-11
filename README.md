# Meet-AI 🎥🤖 
(In-progress)

Meet-AI is a real-time video conferencing platform that enables users to create, host, and join online meetings with secure authentication and live communication. The application provides a meeting lobby, participant management, invitation system, and peer-to-peer video calling using WebRTC.

## Features

* 🔐 User Authentication (JWT-based Login & Registration)
* 📅 Create and Manage Meetings
* 👥 Invite Participants to Meetings
* 🏠 Meeting Lobby and Waiting Room
* 🎥 Real-Time Video & Audio Communication using WebRTC
* ⚡ Live Participant Updates with Socket.IO
* 🔄 Automatic Reconnection and Session Persistence
* 🛡️ Secure Backend with Express, Prisma, and PostgreSQL

## Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Socket.IO Client
* WebRTC

### Backend

* Node.js
* Express.js
* Socket.IO
* Prisma ORM
* PostgreSQL
* JWT Authentication
* bcrypt.js

## How It Works

1. Users register and log in securely.
2. Hosts create meetings and invite participants.
3. Participants join a meeting lobby or waiting room.
4. When the host starts the meeting, all participants enter the meeting room.
5. WebRTC establishes peer-to-peer connections for audio and video streaming.
6. Socket.IO handles real-time signaling, participant updates, and meeting events.
7. Users can reconnect and continue participating without losing meeting state.

## Future Enhancements

* 🎙️ Mute / Unmute Audio
* 📹 Toggle Camera
* 💬 Real-Time Chat
* 🖥️ Screen Sharing
* 📊 AI-Based Meeting Analytics
* 📝 Meeting Recording & Transcription
* 🤖 AI Meeting Summaries

## Learning Outcomes

This project demonstrates:

* Real-time communication with Socket.IO
* Peer-to-peer media streaming using WebRTC
* Authentication and authorization with JWT
* Database management using Prisma ORM
* Full-stack application development with React and Node.js
* Handling reconnections and live participant synchronization

---

**Meet-AI** aims to provide a lightweight and scalable virtual meeting experience while serving as a practical implementation of modern real-time web technologies. 🚀
