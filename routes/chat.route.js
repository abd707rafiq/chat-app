const express = require('express');

const { realMessage, getallConversation, allMessages } = require('../controllers/chat.js');
const {verifyToken}=require('../middleware/jwt.js')
const multer = require('multer');
const path = require('path');

// Configure Multer for storing uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Specify the upload directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filenames using timestamp
    }
});
const upload = multer({ storage: storage });

const router = express.Router();





router.post("/message",verifyToken,upload.single('file'), realMessage);
router.get("/all/:userId",verifyToken,getallConversation);
router.get("/allm/:conversationId",verifyToken,allMessages);

module.exports=router;