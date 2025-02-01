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

// Define allowed origins for deployment
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.ORIGIN
].filter(Boolean);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST"]
    }
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