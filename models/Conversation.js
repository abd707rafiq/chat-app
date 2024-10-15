
const mongoose = require('mongoose');


const ConversationSchema = new mongoose.Schema({
    senderId: { type:  mongoose.Schema.Types.ObjectId, ref: 'User'  },
    receiverId: { type:  mongoose.Schema.Types.ObjectId, ref: 'User'  },
    groupId: { type:  mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastMessage: { type: String }, // Optional: for storing the last message text

    archived: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
