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
const onlineUsers = new Map();

const io = new Server(httpServer, {
    cors: {
        origin: ['https://pawkeeper.netlify.app', 'http://localhost:5173'],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    },
    pingTimeout: 60000,
    pingInterval: 25000
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
            .select('username email profilePicture sitter')
            .lean();
        
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
    console.log('User connected:', socket.user.username);
    const userId = socket.user._id.toString();
    
    // Add user to online users
    onlineUsers.set(userId, socket.id);
    
    // Emit updated online users list to all clients
    io.emit('user_connected', userId);
    io.emit('users_online', Array.from(onlineUsers.keys()));

    // Handle online users request
    socket.on('get_online_users', () => {
        socket.emit('users_online', Array.from(onlineUsers.keys()));
    });

    // Handle private chat
    socket.on('start_private_chat', async ({ targetUserId }) => {
        try {
            const targetSocketId = onlineUsers.get(targetUserId);
            if (targetSocketId) {
                const roomId = [userId, targetUserId].sort().join('-');
                socket.join(roomId);
                io.to(targetSocketId).emit('chat_invitation', {
                    roomId,
                    invitedBy: socket.user.username,
                    invitedById: userId
                });
            }
        } catch (error) {
            console.error('Private chat error:', error);
            socket.emit('error', 'Failed to start private chat');
        }
    });

    // Handle messaging
    socket.on('send_message', async ({ roomId, content }) => {
        try {
            const messageData = {
                id: Date.now(),
                content,
                sender: socket.user,
                timestamp: new Date()
            };
            io.to(roomId).emit('receive_message', messageData);
        } catch (error) {
            console.error('Message error:', error);
            socket.emit('error', 'Failed to send message');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user.username);
        onlineUsers.delete(userId);
        io.emit('user_disconnected', userId);
        io.emit('users_online', Array.from(onlineUsers.keys()));
    });
};

io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
});

app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port:${PORT}`);
}).on('error', (error) => {
    console.error('Server error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});