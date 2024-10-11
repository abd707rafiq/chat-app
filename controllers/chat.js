const Message = require('../models/Message.js');
const User=require('../models/User.js')
const Conversation = require('../models/Conversation.js');
const { getSocket } = require('../socket'); 
const mongoose = require('mongoose');
const MessageRead=require('../models/MessageRead.js')




const realMessage = async (req, res) => {
    const { receiverId, text } = req.body;
    let file = null; 
    if (!receiverId) {
        return res.status(400).json({ error: 'Receiver ID is required' });
    }

    // Validation: Check if both file and text are missing
    if (!text && !req.file) {
        return res.status(400).json({ error: 'Either text or file is required' });
    }

   
    if (req.file) {
        file = req.file.path; 
    }
    
    
    

    try {
        const receiverExists = await User.findById(receiverId);
        if (!receiverExists) {
            return res.status(404).json({ error: 'Receiver not found in database' });
        }
        
        
        let conversation = await Conversation.findOne({
            $or: [
                { senderId: req.userId, receiverId: receiverId },
                { senderId: receiverId, receiverId: req.userId }
            ]
        });
        

        if (!conversation) {
            
            conversation = new Conversation({
                senderId: req.userId,
                receiverId: receiverId,
                lastMessage: text || file, 
                updatedAt: Date.now(),
            });
            await conversation.save();
        }

       

        
        const message = new Message({
            conversationId: conversation._id,
            senderId: req.userId,
            receiverId: receiverId,
            text: text || '',  
            file: file || null,
        });
        

        const savedMessage = await message.save();

        
        conversation.lastMessage = text || file;
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




const markMessageAsRead = async (req, res) => {
    const { conversationId } = req.params; 
    const userId = req.userId;  
    try {
       
        const alreadyReadMessages = await MessageRead.find({
            readerId: userId,
            conversationId: conversationId
        }).select('messageId');

        
        const alreadyReadMessageIds = alreadyReadMessages.map(entry => entry.messageId.toString());

        
        const unreadMessages = await Message.find({
            conversationId: conversationId,
            receiverId: userId,  
            _id: { $nin: alreadyReadMessageIds }  
        });

        if (!unreadMessages || unreadMessages.length === 0) {
            return res.status(200).json({ message: 'No unread messages' });
        }

        // Create `MessageRead` entries for all unread messages
        const messageReadEntries = unreadMessages.map(message => ({
            messageId: message._id,
            readerId: userId,
            conversationId: message.conversationId,
            readAt: Date.now()
        }));

        // Save all the read entries in the database
        await MessageRead.insertMany(messageReadEntries);

        // Notify the sender(s) through socket for each message read
        const io = getSocket();
        unreadMessages.forEach(message => {
            io.emit('messageRead', {
                messageId: message._id,
                readerId: userId,
                conversationId: conversationId
            });
        });

        // If it's a group chat, notify all participants except the reader
        unreadMessages.forEach(message => {
            if (message.groupId) {
                io.to(message.groupId).emit('groupMessageRead', {
                    messageId: message._id,
                    readerId: userId,
                    conversationId: conversationId
                });
            }
        });

        res.status(200).json({ message: 'Messages marked as read', readMessages: messageReadEntries });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Error marking messages as read' });
    }
};


module.exports = { realMessage,getallConversation,allMessages,markMessageAsRead};
