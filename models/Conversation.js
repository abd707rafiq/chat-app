
const mongoose = require('mongoose');


const ConversationSchema = new mongoose.Schema({
    senderId: { type:  mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type:  mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessage: { type: String }, // Optional: for storing the last message text
    updatedAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
