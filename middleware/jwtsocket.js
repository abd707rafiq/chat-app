const jwt = require("jsonwebtoken");
require('dotenv').config();

const verifySocketToken = (socket, next) => {
    const token = socket.handshake.headers['authorization']; // or from headers like socket.handshake.headers['authorization']
    
    if (!token) {
        return next(new Error('Access denied'));
    }

    try {
        // Verify the token and extract the userId
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = verified.id; // Attach the userId to the socket object
        next(); // Proceed to the connection event
    } catch (error) {
        console.error('Invalid token:', error);
        return next(new Error('Authentication error'));
    }
};

module.exports = { verifySocketToken };
