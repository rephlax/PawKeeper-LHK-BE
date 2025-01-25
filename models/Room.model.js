const { Schema, model } = require("mongoose");

const chatRoomSchema = new Schema({
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }],
  lastMessage: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  readBy: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    lastRead: { 
      type: Date, 
      default: Date.now 
    }
  }]
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);