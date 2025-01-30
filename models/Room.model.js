const { Schema, model } = require("mongoose");

const chatRoomSchema = new Schema({
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }],
  lastMessage: { 
    type: Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  updatedAt: { 
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
  }]
});

module.exports = model('ChatRoom', chatRoomSchema);