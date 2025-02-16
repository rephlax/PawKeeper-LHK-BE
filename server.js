console.log("Starting server...");
const { app } = require("./app");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const UserModel = require("./models/User.model");
const ChatRoom = require("./models/Room.model");
const Message = require("./models/Message.model");
const rateLimit = require("express-rate-limit");
const LocationPin = require("./models/LocationPin.model");
const locationSocketHandlers = require("./socket-handlers/locationHandlers");
require("dotenv").config();
const helmet = require("helmet");
const PORT = process.env.PORT || 5005;
const httpServer = createServer(app);
const onlineUsers = new Map();

const allowedOrigins = [
	"https://pawkeeper.netlify.app",
	"http://localhost:5173",
	"http://localhost:3000",
];

const io = new Server(httpServer, {
	cors: {
		origin: function (origin, callback) {
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				return callback(new Error("Not allowed by CORS"));
			}
			return callback(null, true);
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
	},
	pingTimeout: 60000,
	pingInterval: 25000,
});

app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: [
					"'self'",
					"'unsafe-inline'",
					"api.mapbox.com",
					"events.mapbox.com",
				],
				styleSrc: ["'self'", "'unsafe-inline'", "api.mapbox.com"],
				imgSrc: ["'self'", "data:", "blob:", "*.mapbox.com", "api.mapbox.com"],
				connectSrc: [
					"'self'",
					"api.mapbox.com",
					"events.mapbox.com",
					"https://*.tiles.mapbox.com",
				],
				workerSrc: ["'self'", "blob:"],
				childSrc: ["'self'", "blob:"],
			},
		},
	})
);

const globalRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: "Too many requests, please try again later",
});

const locationRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50,
	message: "Too many location requests, please try again later",
});

app.use(globalRateLimiter);

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
			.select("username email profilePicture sitter")
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
	console.log("User connected:", socket.user.username);
	const userId = socket.user._id.toString();

	// Add user to online users
	onlineUsers.set(userId, socket.id);

	// Emit updated online users list to all clients
	io.emit("user_connected", userId);
	io.emit("users_online", Array.from(onlineUsers.keys()));

	locationSocketHandlers(io, socket);
	// Handle online users request
	socket.on("get_online_users", () => {
		socket.emit("users_online", Array.from(onlineUsers.keys()));
	});

	// Handle private chat
	socket.on("start_private_chat", async ({ targetUserId }) => {
		try {
			const targetSocketId = onlineUsers.get(targetUserId);
			if (targetSocketId) {
				const roomId = [userId, targetUserId].sort().join("-");
				socket.join(roomId);
				io.to(targetSocketId).emit("chat_invitation", {
					roomId,
					invitedBy: socket.user.username,
					invitedById: userId,
				});
			}
		} catch (error) {
			console.error("Private chat error:", error);
			socket.emit("error", "Failed to start private chat");
		}
	});

	socket.on("get_rooms", async () => {
		try {
			const rooms = await ChatRoom.find({
				participants: socket.user._id,
			})
				.populate("participants", "username profilePicture")
				.populate("lastMessage")
				.sort({ updatedAt: -1 });

			socket.emit("rooms_list", rooms);
		} catch (error) {
			console.error("Error fetching rooms:", error);
			socket.emit("error", {
				message: "Failed to fetch rooms",
				details: error.message,
			});
		}
	});

	socket.on("create_room", async ({ name, type, participants }) => {
		try {
			console.log("Received room creation request:", {
				name,
				type,
				participants,
				creatorId: socket.user._id,
			});

			const newRoom = await ChatRoom.create({
				name,
				type: type || "group",
				participants: [socket.user._id, ...participants],
				creator: socket.user._id,
				isActive: true,
				lastActive: new Date(),
			});

			// Populate participants before sending
			const populatedRoom = await newRoom.populate(
				"participants",
				"username profilePicture"
			);

			console.log("Room created successfully:", populatedRoom);

			// Notify participants
			participants.forEach((participantId) => {
				io.to(participantId).emit("room_invitation", {
					roomId: newRoom._id,
					roomName: name,
					invitedBy: socket.user.username,
					invitedById: socket.user._id,
				});
			});

			// Send room details back to creator
			socket.emit("room_created", populatedRoom);
		} catch (error) {
			console.error("Room creation error:", error);
			socket.emit("error", {
				message: "Failed to create room",
				details: error.message,
			});
		}
	});

	socket.on("join_room", async (roomId) => {
		try {
			const room = await ChatRoom.findById(roomId)
				.populate("participants", "username profilePicture")
				.populate("lastMessage");

			if (!room) {
				throw new Error("Room not found");
			}

			// Check if user is already a participant
			if (
				!room.participants.some(
					(p) => p._id.toString() === socket.user._id.toString()
				)
			) {
				await ChatRoom.findByIdAndUpdate(roomId, {
					$addToSet: { participants: socket.user._id },
				});
			}

			// Join the socket room
			socket.join(roomId);

			// Notify all participants
			room.participants.forEach((participant) => {
				io.to(participant._id.toString()).emit("user_joined_room", {
					roomId,
					user: socket.user,
				});
			});

			// Send room details back to the user
			socket.emit("room_joined", room);
		} catch (error) {
			console.error("Join room error:", error);
			socket.emit("error", {
				message: "Failed to join room",
				details: error.message,
			});
		}
	});

	// Handle messaging
	socket.on("send_message", async ({ roomId, content }) => {
		try {
			const newMessage = await Message.create({
				chatRoom: roomId,
				sender: socket.user._id,
				content,
				timeStamp: new Date(),
			});

			await ChatRoom.findByIdAndUpdate(roomId, {
				lastMessage: newMessage._id,
				updatedAt: new Date(),
			});

			await newMessage.populate("sender", "username profilePicture");

			io.to(roomId).emit("receive_message", {
				id: newMessage._id,
				content: newMessage.content,
				sender: newMessage.sender,
				timestamp: newMessage.timeStamp,
				roomId,
			});
		} catch (error) {
			console.error("Message sending error:", error);
			socket.emit("error", {
				message: "Failed to send message",
				details: error.message,
			});
		}
	});

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.user.username);
		onlineUsers.delete(userId);
		io.emit("user_disconnected", userId);
		io.emit("users_online", Array.from(onlineUsers.keys()));
	});
};

io.on("connection", (socket) => {
	registerSocketHandlers(io, socket);
});

app.use((err, req, res, next) => {
	console.error("Server error:", err.stack);
	res.status(500).json({ message: "Internal server error" });
});

httpServer
	.listen(PORT, () => {
		console.log(`Server listening on port:${PORT}`);
	})
	.on("error", (error) => {
		console.error("Server error:", error);
	});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
