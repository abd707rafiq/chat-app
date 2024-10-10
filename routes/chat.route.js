const express = require('express');

const { realMessage, getallConversation, allMessages } = require('../controllers/chat.js');
const {verifyToken}=require('../middleware/jwt.js')
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/message",verifyToken,upload.single('file'), realMessage);
router.get("/all/:userId",verifyToken,getallConversation);
router.get("/allm/:conversationId",verifyToken,allMessages);

module.exports=router;