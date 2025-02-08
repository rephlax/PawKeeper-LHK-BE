const messageHandlers = require('./messageHandlers');
const roomHandlers = require('./roomHandlers');
const typingHandlers = require('./typingHandlers');

const registerSocketHandlers = (io, socket) => {
    console.log('User connected:', socket.user.username);

    // Track online users
    const userId = socket.user._id.toString();
    socket.join(userId);

    // Register handlers
    messageHandlers(io, socket);
    roomHandlers(io, socket);
    typingHandlers(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user.username);
        socket.leave(userId);
    });
};

module.exports = registerSocketHandlers;