const Message = require('../models/Message.js');
const Conversation = require('../models/Conversation.js');
const { getSocket } = require('../socket'); 
const mongoose = require('mongoose');

const realMessage = async (req, res) => {
    const { receiverId, text } = req.body;

    try {
        let conversation = await Conversation.findOne({
            $or: [
                { senderId: req.userId, receiverId: receiverId },
                { senderId: receiverId, receiverId: req.userId }
            ]
        });

        
        if (!conversation) {
            conversation = new Conversation({
                senderId: req.userId,
                receiverId: receiverId
            });
            await conversation.save();
        }

       
        const message = new Message({
            conversationId: conversation._id,
            senderId: req.userId,
            receiverId,
            text
        });

        const savedMessage = await message.save();

       
        conversation.lastMessage = text;
        conversation.updatedAt = Date.now();
        await conversation.save();

        
        const io = getSocket();
        io.emit('newMessage', savedMessage);

        res.status(200).json(savedMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: 'Error sending message' });
    }
};


const getallConversation = async (req, res) => {
    const userId = req.params.userId; // Assuming the userId is passed in the URL params

    try {
        // Log the userId to ensure it's being captured correctly
        console.log('User ID:', userId);

        // Convert userId to ObjectId correctly
        const objectId = new mongoose.Types.ObjectId(userId);

        // Log the ObjectId to ensure it's being cast properly
        console.log('Converted Object ID:', objectId);

        // Find conversations where the user is either the sender or receiver
        const conversations = await Conversation.find({
            $or: [
                { senderId: objectId },
                { receiverId: objectId }
            ]
        }).populate('senderId receiverId', 'name email'); // Populating sender and receiver details

        // Check if conversations were found
        if (!conversations || conversations.length === 0) {
            return res.status(404).json({ message: "No conversations found" });
        }

        // Send back the conversations
        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Error fetching conversations' });
    }
}
module.exports = { realMessage,getallConversation };
