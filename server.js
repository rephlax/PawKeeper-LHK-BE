console.log("Starting server...");
const { app, allowedOrigins } = require("./app");  // Import allowedOrigins from app.js
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const UserModel = require("./models/User.model");
const registerSocketHandlers = require('./socket-handlers');
require("dotenv").config();

const PORT = process.env.PORT || 5005;
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ['Content-Type', 'Authorization'],
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

io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});