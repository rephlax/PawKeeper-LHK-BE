const ChatRoom = require('../models/Room.model');

const roomHandlers = (io, socket) => {
    // Start or get private chat
    socket.on('start_private_chat', async ({ targetUserId }) => {
        try {
            // Look for existing room between these users
            const existingRoom = await ChatRoom.findOne({
                participants: { 
                    $all: [socket.user._id, targetUserId],
                    $size: 2 
                }
            });

            if (existingRoom) {
                socket.emit('private_chat_started', existingRoom._id);
                return;
            }

            // Create new room if none exists
            const newRoom = await ChatRoom.create({
                participants: [socket.user._id, targetUserId],
                updatedAt: new Date()
            });

            socket.emit('private_chat_started', newRoom._id);
            
            // Notify the other user
            io.to(targetUserId).emit('chat_invitation', {
                roomId: newRoom._id,
                invitedBy: socket.user._id
            });

        } catch (error) {
            socket.emit('error', 'Failed to start private chat');
        }
    });

    // Handle group chat invites
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