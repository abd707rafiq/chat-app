const express = require('express');
const { createGroup, addMember, groupMessage } = require('../controllers/group');
const {verifyToken}=require('../middleware/jwt.js')
const router = express.Router();


router.post('/create',verifyToken, createGroup);
router.post('/addmember/:groupId',verifyToken,addMember);
router.post('/groupmessage',verifyToken,groupMessage)



module.exports = router;
