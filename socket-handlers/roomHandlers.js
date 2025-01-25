const roomHandlers = (io, socket) => {
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.user.id} joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.user.id} left room ${roomId}`);
    });
};

module.exports = roomHandlers;