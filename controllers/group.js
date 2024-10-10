const Group =require('../models/Group.js')
const Message=require('../models/Message.js')
const Conversation = require('../models/Conversation.js');
const { getSocket } = require('../socket'); 


const createGroup=async(req,res)=>{
    const {name,members}=req.body;
    const createdBy=req.userId;
    try{
        const group =new Group({
            name,
            members,
            admins:[createdBy], //by default admin 
            createdBy

        })
        await group.save();
        res.status(200).json(group);

    }
    catch(error){
        console.error("Error creating group",error);
        res.status(500).json({error:'Error creating group'})
    }

    

}

const addMember=async(req,res)=>{
    const groupId=req.params.groupId;
    console.log('groupid',groupId)
    const {memberId}=req.body;

    try{
        const group= await Group.findById(groupId)
        if(!group){
            return res.status(400).json({message:"Group not found"})
        }
        if(group.members.includes(memberId)){
            return res.status(400).json({message:"Member already in the group"})
        }
        group.members.push(memberId);
        await group.save();
        res.status(200).json(group);

    }catch(error){
        console.error("Error adding group member",error);
        res.status(500).json({error:"Error adding group member"});

    }
}

const groupMessage = async (req, res) => {
    const { groupId, text } = req.body; 
   

    try {
        
        let conversation = await Conversation.findOne({
            $or: [
                { senderId: req.userId, receiverId: groupId },
                { senderId: groupId, receiverId: req.userId }
            ]
        });

        
        if (!conversation) {
            conversation = new Conversation({
                groupId: groupId,
                senderId:req.userId,
                receiverId:groupId,
                lastMessage: text, 
                updatedAt: Date.now(),
                
            });
            await conversation.save();
        }

        
        const message = new Message({
            conversationId: conversation._id,  
            senderId: req.userId,  
            groupId: groupId,  
            text  
        });

        const savedMessage = await message.save();
        console.log("group message",savedMessage);

        
        conversation.lastMessage = text;
        conversation.updatedAt = Date.now();
        await conversation.save();

       
        const io = getSocket();
        io.emit('newGroupMessage', savedMessage);  

        
        res.status(200).json(savedMessage);
    } catch (error) {
        console.error("Error sending group message:", error);
        res.status(500).json({ error: 'Error sending group message' });
    }
};


module.exports={createGroup,addMember,groupMessage}