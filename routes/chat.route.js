const express = require('express');

const { realMessage, getallConversation, allMessages, markMessageAsRead, archiveChat, unarchiveChat, getArchivedConversations, test,} = require('../controllers/chat.js');
const {verifyToken}=require('../middleware/jwt.js')
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, files, cb) {
        cb(null, 'uploads/');  
    },
    filename: function (req, files, cb) {
        cb(null, Date.now() + path.extname(files.originalname)); 
    }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/message",verifyToken,upload.array('files'), realMessage);
router.get("/all/:userId",verifyToken,getallConversation);
router.get("/allmessages/:conversationId",verifyToken,allMessages);

router.patch("/messageread/:conversationId",verifyToken,markMessageAsRead);

/// archive chat routes

router.post("/archivechat/:conversationId",verifyToken,archiveChat);

router.post("/unarchivechat/:conversationId",verifyToken,unarchiveChat);

//router.get("/allarchivechat/:conversationId",verifyToken,getArchivedConversations);

//router.get("/test",test)
module.exports=router;