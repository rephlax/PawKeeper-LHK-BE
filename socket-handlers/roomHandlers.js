const mongoose = require("mongoose");
const ChatRoom = require("../models/Room.model");

const roomHandlers = (io, socket) => {
	// Create a new room
	socket.on("create_room", async (roomData) => {
		try {
			const { name, type, participants } = roomData;

			// Default name to be given for the private chat (NOT USED CURRENTLY)
			const defaultName =
				participants.length === 1
					? `Chat with ${socket.user.username}`
					: `Group Chat (${participants.length + 1} members)`;

			// Validate type
			const validTypes = ["direct", "group"];
			const roomType = validTypes.includes(type) ? type : "direct";

			const newRoom = await ChatRoom.create({
				name,
				type: roomType,
				participants: [socket.user._id, ...participants],
				creator: socket.user._id,
				isActive: true,
				lastActive: new Date(),
			});

			// Join the room yourself
			socket.join(newRoom._id);

			// Notify other participants
			participants.forEach((participantId) => {
				io.to(participantId).emit("room_invitation", {
					roomId: newRoom._id,
					roomName: newRoom.name,
					invitedBy: socket.user.username,
					invitedById: socket.user._id,
				});
			});

			// Send room details back to creator
			socket.emit("room_created", await newRoom.populate("participants"));
		} catch (error) {
			console.error("Room creation error:", error);
			socket.emit("error", {
				message: "Failed to create room",
				details: error.message,
			});
		}
	});

	// Join room
	socket.on("join_room", async (roomId) => {
		try {
			if (typeof roomId !== "string") {
				throw new Error("Room ID must be a string");
			}

			if (!mongoose.Types.ObjectId.isValid(roomId)) {
				throw new Error("Invalid room ID format");
			}

			const room = await ChatRoom.findById(roomId)
				.populate("participants", "username profilePicture")
				.populate("lastMessage");

			if (!room) {
				throw new Error("Room not found");
			}

			const isParticipant = room.participants.some(
				(p) => p._id.toString() === socket.user._id.toString()
			);

			if (!isParticipant) {
				throw new Error("Not authorized to join this room");
			}

			socket.join(roomId);

			socket.emit("room_joined", room);
		} catch (error) {
			console.error("Join room error:", error);
			socket.emit("room_error", {
				message: "Failed to join room",
				details: error.message,
			});
		}
	});

	// Get user's rooms
	socket.on("get_rooms", async () => {
		try {
			const rooms = await ChatRoom.find({
				participants: socket.user._id,
			})
				.populate("participants", "username profilePicture")
				.populate("lastMessage")
				.sort({ lastActive: -1 });

			socket.emit("rooms_list", rooms);
		} catch (error) {
			socket.emit("error", "Failed to get rooms");
		}
	});

	// Leave room
	socket.on("leave_room", async (roomId) => {
		try {
			const room = await ChatRoom.findById(roomId);

			if (!room) return;

			socket.leave(roomId);

			await ChatRoom.findByIdAndUpdate(roomId, {
				$pull: { participants: socket.user._id },
			});

			// Notify other participants
			room.participants.forEach((participantId) => {
				if (participantId.toString() !== socket.user._id.toString()) {
					io.to(participantId.toString()).emit("user_left_room", {
						roomId,
						userId: socket.user._id,
					});
				}
			});
		} catch (error) {
			socket.emit("error", "Failed to leave room");
		}
	});
};

module.exports = roomHandlers;
