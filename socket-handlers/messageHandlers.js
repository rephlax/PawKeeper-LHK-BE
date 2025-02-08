const Message = require('../models/Message.model');
const ChatRoom = require('../models/Room.model');

const messageHandlers = (io, socket) => {
    socket.on('send_message', async (messageData) => {
        try {
            const { roomId, content } = messageData;
            
            // Create and save the message to MongoDB
            const newMessage = await Message.create({
                chatRoom: roomId,
                sender: socket.user,
                content,
                timeStamp: new Date()
            });

            // Update the chat room's last message
            await ChatRoom.findByIdAndUpdate(roomId, {
                lastMessage: newMessage._id,
                updatedAt: new Date()
            });

            // Populate the sender info before sending
            await newMessage.populate('sender');

            // Emit to room
            io.to(roomId).emit('receive_message', {
                id: newMessage._id,
                content: newMessage.content,
                sender: newMessage.sender,
                timeStamp: newMessage.timeStamp,
                roomId
            });

        } catch (error) {
            console.error('Message handling error:', error);
            socket.emit('error', 'Failed to send message');
        }
    });
};

module.exports = messageHandlers;