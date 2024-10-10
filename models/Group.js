const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
       
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // Assuming you have a User model
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Assuming you have a User model
       
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // Admins can also be users
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

 const Group = mongoose.model('Group', GroupSchema);
 module.exports=Group;
