console.log("Starting server...");
const app = require("./app");
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const UserModel = require("./models/User.model");
const registerSocketHandlers = require('./socket-handlers');
require("dotenv").config();

const PORT = process.env.PORT || 5005;
const httpServer = createServer(app);

const allowedOrigins = [
    'https://pawkeeper.netlify.app',
    'https://pawkeeper-lhk-be-production.up.railway.app',
    'http://localhost:5173',
    'http://localhost:5005',
    process.env.ORIGIN
].filter(Boolean);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST"],
        allowedHeaders: ["authorization"],
        allowUpgrades: true
    },
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    upgradeTimeout: 30000
});

app.use(express.json());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});