const typingHandlers = (io, socket) => {
    socket.on('typing', ({ roomId, isTyping }) => {
        socket.to(roomId).emit('user_typing', {
            userId: socket.user.id,
            isTyping
        });
    });
};

module.exports = typingHandlers;