const app = require("./app");
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const PORT = process.env.PORT || 5005;
const httpServer = createServer(app);

// Store connected users and rooms
const connectedUsers = new Map();
const activeRooms = new Map();

const io = new Server(httpServer, {
    cors: {
        origin: process.env.ORIGIN || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors({
    origin: process.env.ORIGIN || "http://localhost:5173",
    credentials: true
}));

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle user registration
    socket.on('register_user', (username) => {
        console.log('User registered:', username);
        connectedUsers.set(socket.id, { id: socket.id, username });
        io.emit('users_list', Array.from(connectedUsers.values()));
    });
    
    // Handle private chat requests
    socket.on('start_private_chat', ({ targetUserId }) => {
        const roomId = [socket.id, targetUserId].sort().join('-');
        socket.join(roomId);
        socket.to(targetUserId).emit('chat_invitation', {
            roomId,
            invitedBy: connectedUsers.get(socket.id)?.username
        });
    });

    // Handle chat invitations
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        socket.emit('private_chat_started', roomId);
    });

    // Handle messages
    socket.on('send_message', (data) => {
        const sender = connectedUsers.get(socket.id);
        const messageData = {
            id: Date.now(),
            text: data.content,
            sender: sender?.username || 'Anonymous',
            roomId: data.roomId,
            timestamp: new Date()
        };

        if (data.roomId) {
            io.to(data.roomId).emit('receive_message', messageData);
        } else {
            io.emit('receive_message', messageData);
        }
    });

    socket.on('disconnect', () => {
        connectedUsers.delete(socket.id);
        io.emit('users_list', Array.from(connectedUsers.values()));
        console.log('Client disconnected:', socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});