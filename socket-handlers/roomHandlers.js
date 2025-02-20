const mongoose = require("mongoose");
const ChatRoom = require("../models/Room.model");
const Message = require("../models/Message.model");

const roomHandlers = (io, socket) => {
	// Create a new room
	socket.on("create_room", async (roomData) => {
		try {
			const { name, type, participants } = roomData;

			const newRoom = await ChatRoom.create({
				name,
				type: type || "direct",
				participants: [socket.user._id, ...participants],
				creator: socket.user._id,
				isActive: true,
				lastActive: new Date(),
			});

			const populatedRoom = await newRoom.populate("participants");

			// Join the room yourself
			socket.join(newRoom._id.toString());

			// Notify and join other participants
			participants.forEach((participantId) => {
				io.to(participantId.toString()).join(newRoom._id.toString());
				io.to(participantId.toString()).emit("room_joined", populatedRoom);
			});

			// Send room details back to creator
			socket.emit("room_created", populatedRoom);

			// Update rooms list for all participants
			[...participants, socket.user._id].forEach((userId) => {
				io.to(userId.toString()).emit("get_rooms");
			});
		} catch (error) {
			console.error("Room creation error:", error);
			socket.emit("error", {
				message: "Failed to create room",
				details: error.message,
			});
		}
	});

	// Join room
	socket.on("join_room", async (roomId, callback) => {
		try {
			if (typeof roomId !== "string") {
				console.error("Room ID must be a string");
				return callback(null, { error: "Room ID must be a string" });
			}

			if (!mongoose.Types.ObjectId.isValid(roomId)) {
				console.error("Invalid room ID format");
				return callback(null, { error: "Invalid room ID format" });
			}

			const room = await ChatRoom.findById(roomId)
				.populate("participants", "username profilePicture")
				.populate("lastMessage");

			if (!room) {
				console.error("Room not found:", roomId);
				return callback(null, { error: "Room not found" });
			}

			const isParticipant = room.participants.some(
				(p) => p._id.toString() === socket.user._id.toString()
			);

			if (!isParticipant) {
				console.error("Not authorized to join room:", {
					roomId,
					userId: socket.user._id,
					participants: room.participants.map((p) => p._id),
				});
				return callback(null, { error: "Not authorized to join this room" });
			}

			socket.join(roomId);

			callback(room, null);
		} catch (error) {
			console.error("Join room error:", error);
			callback(null, {
				error: "Failed to join room",
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

	// Delete room
	socket.on("delete_room", async (roomId) => {
		try {
			// Find the room
			const room = await ChatRoom.findById(roomId);

			// Validate room and creator
			if (!room) {
				console.error("Room not found:", roomId);
				socket.emit("error", { message: "Room not found" });
				return;
			}

			// Ensure only creator can delete
			if (room.creator.toString() !== socket.user._id.toString()) {
				console.error("Unauthorized deletion attempt", {
					roomCreator: room.creator,
					attemptedBy: socket.user._id,
				});
				socket.emit("error", { message: "Not authorized to delete this room" });
				return;
			}

			// Delete associated messages
			await Message.deleteMany({ chatRoom: roomId });

			// Delete the room
			await ChatRoom.findByIdAndDelete(roomId);

			// Notify all participants
			room.participants.forEach((participantId) => {
				io.to(participantId.toString()).emit("room_deleted", roomId);
			});

			console.log("Room deleted successfully:", roomId);
		} catch (error) {
			console.error("Error deleting room:", error);
			socket.emit("error", {
				message: "Error deleting room",
				details: error.message,
			});
		}
	});
};

module.exports = roomHandlers;
