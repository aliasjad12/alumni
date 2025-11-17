const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); 
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/uploads/cvs', express.static(path.join(__dirname, 'uploads/cvs')));
app.use('/uploads/profilePics', express.static(path.join(__dirname, 'uploads/profilePics')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Map userId to socketId for direct messaging and call signaling
const users = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins, save their userId -> socketId mapping
  socket.on('join_room', (userId) => {
    users.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Chat messaging (broadcast only to receiver)
  socket.on('send_message', ({ senderId, receiverId, message }) => {
    console.log('Message received:', { senderId, receiverId, message });
    const receiverSocketId = users.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', { senderId, receiverId, message });
    }
  });

  // --- WebRTC signaling ---

  // Caller sends offer to callee
 socket.on('call_user', ({ userToCall, from, signal, callType }) => {
  const calleeSocketId = users.get(userToCall);
  if (calleeSocketId) {
    io.to(calleeSocketId).emit('incoming_call', { from, signal, callType });
  }
});


  // Callee accepts call and sends answer SDP
  socket.on('accept_call', ({ to, signal }) => {
    const callerSocketId = users.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_accepted', { signal });
    }
  });

  // Callee rejects call
  socket.on('reject_call', ({ to }) => {
    const callerSocketId = users.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_rejected');
    }
  });

  // End call notification
  socket.on('end_call', ({ to }) => {
    const otherSocketId = users.get(to);
    if (otherSocketId) {
      io.to(otherSocketId).emit('call_ended');
    }
  });

  // Relay ICE candidates
  socket.on('ice_candidate', ({ to, candidate }) => {
    const otherSocketId = users.get(to);
    if (otherSocketId) {
      io.to(otherSocketId).emit('ice_candidate', { candidate });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (socket.userId) {
      users.delete(socket.userId);
    }
  });
});

module.exports = { app, io };

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
