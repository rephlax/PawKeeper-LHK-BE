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

	socket.on("delete_room", async (roomId, callback) => {
        console.log('Delete room request:', {
            roomId,
            userId: socket.user?._id,
            socketId: socket.id
        });

        try {
            // Find the room with populated participants
            const room = await ChatRoom.findById(roomId)
                .populate('participants', 'username _id')
                .populate('creator', 'username _id');

            // Detailed logging for room finding
            console.log('Room details:', {
                roomId: room?._id,
                name: room?.name,
                type: room?.type,
                creator: room?.creator?._id,
                participants: room?.participants?.map(p => p._id),
                socketUserId: socket.user?._id
            });

            // Strict authorization checks
            if (!room) {
                console.error('Room not found', roomId);
                return callback({ 
                    error: true, 
                    message: "Room not found" 
                });
            }

            // Ensure user is the creator
            const isCreator = room.creator._id.toString() === socket.user._id.toString();

            if (!isCreator) {
                console.error('Unauthorized room deletion attempt', {
                    roomCreator: room.creator._id,
                    attemptedBy: socket.user._id
                });
                return callback({ 
                    error: true, 
                    message: "Not authorized to delete this room" 
                });
            }

            // Delete associated messages
            const messageDeleteResult = await Message.deleteMany({ chatRoom: roomId });
            console.log('Messages deleted:', messageDeleteResult.deletedCount);

            // Delete the room
            const roomDeleteResult = await ChatRoom.findByIdAndDelete(roomId);
            
            if (!roomDeleteResult) {
                console.error('Room deletion failed', roomId);
                return callback({ 
                    error: true, 
                    message: "Failed to delete room" 
                });
            }

            // Notify all participants
            room.participants.forEach((participant) => {
                io.to(participant._id.toString()).emit("room_deleted", roomId);
            });

            console.log('Room deleted successfully:', {
                roomId,
                deletedBy: socket.user._id
            });

            callback({ 
                success: true, 
                message: "Room deleted successfully" 
            });

        } catch (error) {
            console.error('Critical error in delete_room:', {
                error: error.message,
                stack: error.stack,
                roomId,
                userId: socket.user?._id
            });

            callback({ 
                error: true, 
                message: "Internal server error during room deletion",
                details: error.message 
            });
        }
    });

module.exports = roomHandlers;
