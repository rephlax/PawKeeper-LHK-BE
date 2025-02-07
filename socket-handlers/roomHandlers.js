const ChatRoom = require('../models/Room.model');

const roomHandlers = (io, socket) => {
    // Add join room handler
    socket.on('join_room', async (roomId) => {
        try {
            const room = await ChatRoom.findById(roomId);
            if (room && room.participants.includes(socket.user._id)) {
                socket.join(roomId);
                console.log(`User ${socket.user.username} joined room ${roomId}`);
                socket.emit('private_chat_started', roomId);
            }
        } catch (error) {
            console.error('Join room error:', error);
            socket.emit('error', 'Failed to join room');
        }
    });

    // Start or get private chat
    socket.on('start_private_chat', async ({ targetUserId }) => {
        try {
            console.log('Starting private chat between:', socket.user.username, 'and', targetUserId);
            
            // Look for existing room
            const existingRoom = await ChatRoom.findOne({
                participants: { 
                    $all: [socket.user._id, targetUserId],
                    $size: 2 
                }
            });

            if (existingRoom) {
                socket.join(existingRoom._id);
                socket.emit('private_chat_started', existingRoom._id);
                return;
            }

            // Create new room
            const newRoom = await ChatRoom.create({
                participants: [socket.user._id, targetUserId],
                updatedAt: new Date()
            });
            
            // Join the room yourself
            socket.join(newRoom._id);
            
            // Send different events to each user
            socket.emit('private_chat_started', newRoom._id);
            socket.to(targetUserId).emit('chat_invitation', {
                roomId: newRoom._id,
                invitedBy: socket.user.username,
                invitedById: socket.user._id
            });

        } catch (error) {
            console.error('Private chat error:', error);
            socket.emit('error', 'Failed to start private chat');
        }
    });

    socket.on('invite_to_chat', async ({ roomId, targetUserId }) => {
        try {
            const room = await ChatRoom.findById(roomId);
            
            if (!room.participants.includes(socket.user._id)) {
                throw new Error('Not authorized to invite');
            }
 
            await ChatRoom.findByIdAndUpdate(roomId, {
                $addToSet: { participants: targetUserId }
            });
 
            io.to(targetUserId).emit('chat_invitation', {
                roomId,
                invitedBy: socket.user._id
            });
 
        } catch (error) {
            socket.emit('error', 'Failed to send invitation');
        }
    });
 };

module.exports = roomHandlers;