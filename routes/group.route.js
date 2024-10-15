const express = require('express');
const { createGroup, addMember, groupMessage, makeAdmin, changeGroupName, removeMember } = require('../controllers/group');
const {verifyToken}=require('../middleware/jwt.js')
const router = express.Router();


router.post('/create',verifyToken, createGroup);

router.post('/groupmessage',verifyToken,groupMessage)

// admin routes
router.post('/addmember/:groupId',verifyToken,addMember);
router.post('/makeadmin/:groupId',verifyToken,makeAdmin);
router.post('/changegroupname/:groupId',verifyToken,changeGroupName);
router.delete("/removemember/:groupId",verifyToken,removeMember);


module.exports = router;
