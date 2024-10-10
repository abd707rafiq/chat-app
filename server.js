const express = require('express');
const mongoose = require('mongoose');
const http = require('http');

const authRoutes = require("./routes/auth.route");
const chatRoutes = require("./routes/chat.route");
const groupRoutes=require("./routes/group.route");

const { initSocket } = require('./socket'); 
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/group',groupRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_DB_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);

// Initialize socket.io
initSocket(server);

// Listen for incoming connections
server.listen(3000, () => console.log('Server is running on port 3000'));
