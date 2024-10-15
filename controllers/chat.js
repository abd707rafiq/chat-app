const Message = require('../models/Message.js');
const User = require('../models/User.js')
const Conversation = require('../models/Conversation.js');
const { getSocket } = require('../socket');
const mongoose = require('mongoose');
const MessageRead = require('../models/MessageRead.js')




const realMessage = async (req, res) => {
    const { receiverId, groupId, text } = req.body; 
    let files = [];

  
    if (!receiverId && !groupId) {
        return res.status(400).json({ error: 'Either receiverId or groupId is required' });
    }

   
    if (!text && (!req.files || req.files.length === 0)) {
        return res.status(400).json({ error: 'Either text or at least one file is required' });
    }

   
    if (req.files && req.files.length > 0) {
        files = req.files.map(file => file.path);  
    }

    try {
        let conversation;

        if (groupId) {
            // Handle group message
            conversation = await Conversation.findOne({ groupId });
            if (!conversation) {
                conversation = new Conversation({
                    groupId,
                    senderId: req.userId,
                    lastMessage: text || (files.length > 0 ? 'Files attached' : ''),
                    updatedAt: Date.now(),
                });
                await conversation.save();
            }
        } else if (receiverId) {
            // Handle one-to-one message
            const receiverExists = await User.findById(receiverId);
            if (!receiverExists) {
                return res.status(404).json({ error: 'Receiver not found' });
            }

            conversation = await Conversation.findOne({
                $or: [
                    { senderId: req.userId, receiverId },
                    { senderId: receiverId, receiverId: req.userId }
                ]
            });

            if (!conversation) {
                conversation = new Conversation({
                    senderId: req.userId,
                    receiverId,
                    lastMessage: text || (files.length > 0 ? 'Files attached' : ''),
                    updatedAt: Date.now(),
                });
                await conversation.save();
            }
        }

        
        const message = new Message({
            conversationId: conversation._id,
            senderId: req.userId,
            receiverId: receiverId || null,  
            groupId: groupId || null,         
            text: text || '',
            files: files.length > 0 ? files : null,  
        });

        const savedMessage = await message.save();

        
        conversation.lastMessage = text || (files.length > 0 ? 'Files attached' : '');
        conversation.updatedAt = Date.now();
        await conversation.save();

        
        const io = getSocket();
        io.to(receiverId  ).emit('newMessage', {
            message: savedMessage,
            isGroupMessage: !!groupId,
           
        });

        
        res.status(200).json(savedMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: 'Error sending message' });
    }
};




const getallConversation = async (req, res) => {
    const userId = req.userId;
    const isArchived = req.query.archived === 'true'; 

    try {
        
        const filter = {
            $or: [
                { senderId: userId },
                { receiverId: userId },
                { groupId: { $exists: true } }, 
            ],
            archived: isArchived,  
        };

        const conversations = await Conversation.find(filter)
            .populate('senderId receiverId', 'name email')
            .sort({ updatedAt: -1 });

        if (!conversations || conversations.length === 0) {
            return res.status(404).json({ message: isArchived ? "No archived conversations found" : "No conversations found" });
        }

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Error fetching conversations' });
    }
}

const allMessages = async (req, res) => {
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
       
        const readMessageIds = await MessageRead.find({ readerId: userId })
            .select('messageId')
            .lean()
            .exec();

       
        const readMessageIdsArray = readMessageIds.map(entry => entry.messageId.toString());

        
        const unreadMessages = await Message.find({
            conversationId: conversationId,
            receiverId: userId,
            _id: { $nin: readMessageIdsArray }
        }).lean().exec();

        
        if (!unreadMessages || unreadMessages.length === 0) {
            return res.status(200).json({ message: 'No unread messages' });
        }

        
        const messageReadEntries = unreadMessages.map(message => ({
            messageId: message._id,
            readerId: userId,
            conversationId: message.conversationId,
            readAt: Date.now()
        }));

        
        await MessageRead.insertMany(messageReadEntries);

        
        const io = getSocket();
        unreadMessages.forEach(message => {
            // Emit general message read event
            io.to(receiverId).emit('messageRead', {
                messageId: message._id,
                readerId: userId,
                conversationId: conversationId
            });

           
           
        });

        // Respond with a success message and the read messages
        res.status(200).json({ message: 'Messages marked as read', readMessages: messageReadEntries });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Error marking messages as read' });
    }
};


///archived chats api

// Archive a conversation (one-to-one or group)
const archiveChat = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.userId;

    try {
        
        const conversation = await Conversation.findOne({
            _id: conversationId,
            $or: [
                { senderId: userId },
                { receiverId: userId },
                { groupId: { $exists: true } }, // for group chats
            ],
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found or you are not a part of it' });
        }

       
        conversation.archived = true;
        await conversation.save();

        res.status(200).json({ message: 'Conversation archived successfully' });
    } catch (error) {
        console.error('Error archiving conversation:', error);
        res.status(500).json({ error: 'Error archiving conversation' });
    }
};

// unarchive chat api

const unarchiveChat = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.userId;

    try {
        
        const conversation = await Conversation.findOne({
            _id: conversationId,
            $or: [
                { senderId: userId },
                { receiverId: userId },
                { groupId: { $exists: true } }, // for group chats
            ],
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found or you are not a part of it' });
        }

        
        conversation.archived = false;
        await conversation.save();

        res.status(200).json({ message: 'Conversation unarchived successfully' });
    } catch (error) {
        console.error('Error unarchiving conversation:', error);
        res.status(500).json({ error: 'Error unarchiving conversation' });
    }
};


/// get all archived chat


{/*const getArchivedConversations = async (req, res) => {
    const userId = req.userId;

    try {
        
        
        const archivedConversations = await Conversation.find({
            archived: true,
            $or: [
                { senderId: userId },
                { receiverId: userId },
                { groupId: { $exists: true } }, // for group chats
            ],
        });
        if (!archivedConversations || archivedConversations.length === 0) {
            return res.status(404).json({ message: "No archived conversations found" });
        }

        res.status(200).json(archivedConversations);
    } catch (error) {
        console.error('Error fetching archived conversations:', error);
        res.status(500).json({ error: 'Error fetching archived conversations' });
    }
};*/}



{/*async function test(req,res) {
    const socket = getSocket()

    socket.to("123").emit("newMessage",{
        hello:"THere"
    })

    return res.json("success")
} */}
module.exports = {
    realMessage, getallConversation,
    allMessages, markMessageAsRead, archiveChat,

    unarchiveChat,
   // getArchivedConversations,
    
};
