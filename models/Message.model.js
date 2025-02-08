// Message.model.js
const {Schema, model} = require('mongoose');

const messageSchema = new Schema({
    chatRoom: {
        type: Schema.Types.ObjectId,
        ref: 'ChatRoom'
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    timeStamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    lastEdited: {
        type: Date,
        default: null
    }
});

module.exports = model('Message', messageSchema);