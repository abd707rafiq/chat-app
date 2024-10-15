const Group =require('../models/Group.js')
const Message=require('../models/Message.js')
const Conversation = require('../models/Conversation.js');
const { getSocket } = require('../socket'); 
const mongoose=require('mongoose')


const createGroup=async(req,res)=>{
    const {name,members}=req.body;
    const createdBy=req.userId;
    try{
        const group =new Group({
            name,
            members,
            admins:[createdBy],  
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
const changeGroupName = async (req, res) => {
    const groupId=req.params.groupId;
    const {  newName } = req.body;
    const userId = req.userId;  

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if the user making the request is an admin
        if (!group.admins.includes(userId)) {
            return res.status(403).json({ error: 'Only admins can change the group name' });
        }

        // Update the group name
        group.name = newName;
        await group.save();

        res.status(200).json({ message: 'Group name updated', group });
    } catch (error) {
        console.error('Error changing group name', error);
        res.status(500).json({ error: 'Error changing group name' });
    }
};

const makeAdmin = async (req, res) => {
    const groupId = req.params.groupId;
    const {memberId} = req.body;
    const userId = req.userId;

    try {
        // Log the memberId being passed in the request
        console.log("Received memberId:", memberId);

        // Validate the provided group ID and member ID as ObjectIds
        

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if the logged-in user is an admin
        if (!group.admins.includes(userId)) {
            return res.status(403).json({ error: 'Only admins can make members admins' });
        }

        // Check if the member is part of the group
        if (!group.members.includes(memberId)) {
            return res.status(400).json({ error: 'Member not found in the group' });
        }

        // Check if the member is already an admin
        if (group.admins.includes(memberId)) {
            return res.status(400).json({ error: 'Member is already an admin' });
        }

        

        // Add the member as an admin
        group.admins.push(new mongoose.Types.ObjectId(memberId)); // Ensure ObjectId format
        await group.save();

        res.status(200).json({ message: 'Member has been made an admin', group });
    } catch (error) {
        console.error('Error making member admin', error);
        res.status(500).json({ error: 'Error making member admin' });
    }
};

const addMember=async(req,res)=>{
    const groupId=req.params.groupId;
    console.log('groupid',groupId)
    const {memberId}=req.body;
    const userId=req.userId;

    try{
        const group= await Group.findById(groupId)
        if(!group){
            return res.status(400).json({message:"Group not found"})
        }
        if (!group.admins.includes(userId)) {
            return res.status(403).json({ error: 'Only admins can add members' });
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


const removeMember = async (req, res) => {
    const groupId=req.params.groupId;
    const { memberId } = req.body;
    const userId = req.userId;  // The logged-in user

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if the user making the request is an admin
        if (!group.admins.includes(userId)) {
            return res.status(403).json({ error: 'Only admins can remove members' });
        }

        // Check if the member is in the group
        if (!group.members.includes(memberId)) {
            return res.status(400).json({ error: 'Member not found in the group' });
        }

        // Remove the member
        group.members = group.members.filter(member => member.toString() !== memberId);
       
        await group.save();

        res.status(200).json({ message: 'Member removed from the group', group });
    } catch (error) {
        console.error('Error removing member', error);
        res.status(500).json({ error: 'Error removing member' });
    }
};


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


module.exports={createGroup,addMember,groupMessage,makeAdmin,removeMember,changeGroupName}