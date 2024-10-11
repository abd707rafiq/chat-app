const mongoose = require('mongoose');

const messageReadSchema = new mongoose.Schema({
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: true
    },
    readerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    readAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const MessageRead = mongoose.model('MessageRead', messageReadSchema);

module.exports=MessageRead;
