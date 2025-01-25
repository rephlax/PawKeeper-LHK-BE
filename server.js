const app = require("./app");
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const registerSocketHandlers = require('./socket-handlers');
require("dotenv").config();

const PORT = process.env.PORT || 5005;
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.ORIGIN || "http://localhost:3000",
        credentials: true
    }
});

app.use(express.json());
app.use(cors({
    origin: process.env.ORIGIN || "http://localhost:3000",
    credentials: true
}));

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication required - No token provided"));
        }
        
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        socket.user = decoded;
        next();
        
    } catch (error) {
        console.log("Socket authentication error:", error.message);
        next(new Error("Authentication failed - Invalid token"));
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.user);
    
    // Register all socket event handlers (chat)
    registerSocketHandlers(io, socket);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});