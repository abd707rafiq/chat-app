

const mongoose = require('mongoose');


const MessageSchema = new mongoose.Schema({
    conversationId: { type:  mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    senderId: { type:  mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiverId:      { type:  mongoose.Schema.Types.ObjectId, ref: 'User'},
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group' 
    },
    
    text: { type: String, required: false },
    files: { type: [String], required: false }, 
    createdAt: { type: Date, default: Date.now }
    
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
