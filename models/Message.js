

const mongoose = require('mongoose');


const MessageSchema = new mongoose.Schema({
    conversationId: { type:  mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type:  mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type:  mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
    
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
