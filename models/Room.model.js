const { Schema, model } = require("mongoose");

const chatRoomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['direct', 'group'],
        default: 'direct'
    },
    participants: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastMessage: { 
        type: Schema.Types.ObjectId, 
        ref: 'Message' 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    readBy: [{
        user: { 
            type: Schema.Types.ObjectId, 
            ref: 'User' 
        },
        lastRead: { 
            type: Date, 
            default: Date.now 
        }
    }],
    pendingInvites: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = model('ChatRoom', chatRoomSchema);