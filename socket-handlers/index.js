const messageHandlers = require('./messageHandlers');
const roomHandlers = require('./roomHandlers');

const registerSocketHandlers = (io, socket) => {
    
    console.log('User connected:', socket.user);

    // Register handlers
    messageHandlers(io, socket);
    roomHandlers(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user);
    });
};

module.exports = registerSocketHandlers;