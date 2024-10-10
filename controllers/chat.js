const Message = require('../models/Message.js');
const Conversation = require('../models/Conversation.js');
const { getSocket } = require('../socket'); 
const mongoose = require('mongoose');

const multer = require('multer');

// The message API that handles both text and file uploads
const realMessage = async (req, res) => {
    const { receiverId, text } = req.body;
    let file = null; // Initialize file path for optional file uploads

    // Check if a file was uploaded
    if (req.file) {
        file = req.file.path; // Save the file path
    }

    try {
        // Find or create the conversation
        let conversation = await Conversation.findOne({
            $or: [
                { senderId: req.userId, receiverId: receiverId },
                { senderId: receiverId, receiverId: req.userId }
            ]
        });

        if (!conversation) {
            // Create a new conversation if none exists
            conversation = new Conversation({
                senderId: req.userId,
                receiverId: receiverId,
                lastMessage: text || filePath, // Use either text or file name as the last message
                updatedAt: Date.now(),
            });
            await conversation.save();
        }

        // Create a new message (with text or file or both)
        const message = new Message({
            conversationId: conversation._id,
            senderId: req.userId,
            receiverId: receiverId,
            text: text || '',  // Default to an empty string if no text is provided
            file: file || null, // Add the filePath if a file was uploaded
        });

        const savedMessage = await message.save();

        // Update the conversation's last message and time
        conversation.lastMessage = text || filePath;
        conversation.updatedAt = Date.now();
        await conversation.save();

        // Emit the message via WebSocket
        const io = getSocket();
        io.emit('newMessage', savedMessage);

        res.status(200).json(savedMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: 'Error sending message' });
    }
};



const getallConversation = async (req, res) => {
    const userId = req.params.userId; 

    try {
        
        console.log('User ID:', userId);

        
        const objectId = new mongoose.Types.ObjectId(userId);

        
        console.log('Converted Object ID:', objectId);

        
        const conversations = await Conversation.find({
            $or: [
                { senderId: objectId },
                { receiverId: objectId }
            ]
        }).populate('senderId receiverId', 'name email'); 

        
        if (!conversations || conversations.length === 0) {
            return res.status(404).json({ message: "No conversations found" });
        }

      
        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Error fetching conversations' });
    }
}

const allMessages=async(req,res)=>{
    const { conversationId } = req.params; 
    try {
        
        const messages = await Message.find({ conversationId: conversationId })

        
        if (!messages || messages.length === 0) {
            return res.status(404).json({ message: "No messages found for this conversation." });
        }

        
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Error fetching messages' });
    }
};


module.exports = { realMessage,getallConversation,allMessages};
