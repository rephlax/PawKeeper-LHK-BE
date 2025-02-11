const ChatRoom = require('../models/Room.model');

const roomHandlers = (io, socket) => {
    // Create a new room
    socket.on('create_room', async ({ name, type, participants }) => {
        try {
            const newRoom = await ChatRoom.create({
                name,
                type,
                participants: [socket.user._id, ...participants],
                creator: socket.user._id,
                isActive: true,
                lastActive: new Date()
            });

            // Join the room yourself
            socket.join(newRoom._id);

            // Notify other participants
            participants.forEach(participantId => {
                io.to(participantId).emit('room_invitation', {
                    roomId: newRoom._id,
                    roomName: name,
                    invitedBy: socket.user.username,
                    invitedById: socket.user._id
                });
            });

            // Send room details back to creator
            socket.emit('room_created', await newRoom.populate('participants'));

        } catch (error) {
            console.error('Room creation error:', error);
            socket.emit('error', 'Failed to create room');
        }
    });

    // Join room
    socket.on('join_room', async (roomId) => {
        try {
            const room = await ChatRoom.findById(roomId)
                .populate('participants', 'username profilePicture')
                .populate('lastMessage');

            if (!room) {
                throw new Error('Room not found');
            }

            // Check if user is invited or already a participant
            if (!room.participants.some(p => p._id.toString() === socket.user._id.toString()) &&
                !room.pendingInvites.includes(socket.user._id)) {
                throw new Error('Not authorized to join this room');
            }

            // Add user to participants if they were in pendingInvites
            if (room.pendingInvites.includes(socket.user._id)) {
                await ChatRoom.findByIdAndUpdate(roomId, {
                    $pull: { pendingInvites: socket.user._id },
                    $addToSet: { participants: socket.user._id }
                });
            }

            socket.join(roomId);
            
            // Notify all participants
            room.participants.forEach(participant => {
                io.to(participant._id.toString()).emit('user_joined_room', {
                    roomId,
                    user: socket.user
                });
            });

            socket.emit('room_joined', room);

        } catch (error) {
            console.error('Join room error:', error);
            socket.emit('error', error.message);
        }
    });

    // Get user's rooms
    socket.on('get_rooms', async () => {
        try {
            const rooms = await ChatRoom.find({
                participants: socket.user._id
            })
            .populate('participants', 'username profilePicture')
            .populate('lastMessage')
            .sort({ lastActive: -1 });

            socket.emit('rooms_list', rooms);
        } catch (error) {
            socket.emit('error', 'Failed to get rooms');
        }
    });

    // Leave room
    socket.on('leave_room', async (roomId) => {
        try {
            const room = await ChatRoom.findById(roomId);
            
            if (!room) return;

            socket.leave(roomId);
            
            await ChatRoom.findByIdAndUpdate(roomId, {
                $pull: { participants: socket.user._id }
            });

            // Notify other participants
            room.participants.forEach(participantId => {
                if (participantId.toString() !== socket.user._id.toString()) {
                    io.to(participantId.toString()).emit('user_left_room', {
                        roomId,
                        userId: socket.user._id
                    });
                }
            });

        } catch (error) {
            socket.emit('error', 'Failed to leave room');
        }
    });
};

module.exports = roomHandlers;