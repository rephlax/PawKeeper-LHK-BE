const messageHandlers = (io, socket) => {
    socket.on('send_message', async (messageData) => {
        try {
            const { roomId, content } = messageData;
            
            const newMessage = {
                room: roomId,
                sender: socket.user,
                content,
                createdAt: new Date()
            };

            // Emit to room
            io.to(roomId).emit('receive_message', newMessage);

        } catch (error) {
            socket.emit('error', 'Failed to send message');
        }
    });
};