// socket.js
let io;

const initSocket = (server) => {
    const { Server } = require('socket.io');
    io = new Server(server);

    io.on('connection', (socket) => {
        console.log('A user connected');
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

const getSocket = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};

module.exports = { initSocket, getSocket };
