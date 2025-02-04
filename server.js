console.log("Starting server...");
const { app } = require("./app");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const UserModel = require("./models/User.model");
require("dotenv").config();

const PORT = process.env.PORT || 5005;
const httpServer = createServer(app);

// Track online users
const onlineUsers = new Map();

const io = new Server(httpServer, {
    cors: {
        origin: 'https://pawkeeper.netlify.app',
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
        allowUpgrades: true
    },
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    upgradeTimeout: 30000
});

app.use(express.json());

// Authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication required"));
        }
        
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await UserModel.findById(decoded._id)
            .select('username email profilePicture sitter');
        
        if (!user) {
            return next(new Error("User not found"));
        }
            
        socket.user = user;
        next();
    } catch (error) {
        console.log("Socket authentication error:", error.message);
        next(new Error("Authentication failed"));
    }
});

const registerSocketHandlers = (io, socket) => {
    const userId = socket.user._id.toString();
    
    onlineUsers.set(userId, socket.id);
    
    io.emit('users_online', Array.from(onlineUsers.keys()));

    socket.on('get_online_users', () => {
        socket.emit('users_online', Array.from(onlineUsers.keys()));
    });

    socket.on('start_private_chat', async ({ targetUserId }) => {
        const targetSocketId = onlineUsers.get(targetUserId);
        if (targetSocketId) {
            const roomId = [userId, targetUserId].sort().join('-');
            socket.join(roomId);
            io.to(targetSocketId).emit('chat_invitation', {
                roomId,
                invitedBy: socket.user.username
            });
        }
    });

    socket.on('disconnect', () => {
        onlineUsers.delete(userId);
        io.emit('users_online', Array.from(onlineUsers.keys()));
    });
};

io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port:${PORT}`);
});