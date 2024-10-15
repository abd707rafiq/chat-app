// socket.js
let io;

const initSocket = (server) => {
    const { Server } = require('socket.io');
    io = new Server(server);

    io.on('connection', (socket) => {
        
        const query = socket.handshake.query;
        const userId = query?.userId; 
        console.log('A user connected:', userId);
        
        if (userId) {
            socket.join(userId); 
        } else {
            console.log('No receiverId provided in the query');
        }

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
