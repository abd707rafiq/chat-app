const express = require('express');

const { realMessage, getallConversation } = require('../controllers/chat.js');
const {verifyToken}=require('../middleware/jwt.js')


const router = express.Router();





router.post("/message",verifyToken, realMessage);
router.get("/all/:userId",verifyToken,getallConversation);

module.exports=router;