const router = require("express").Router();
const Message = require("../models/Message.model");
const isAuthenticated = require("../middlewares/auth.middleware");

// Get messages for a specific chat room
router.get("/room/:roomId", isAuthenticated, async (req, res) => {
    try {
        const messages = await Message.find({ 
            chatRoom: req.params.roomId,
            isDeleted: false
        })
            .populate('sender')
            .sort({ timeStamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Edit
router.patch("/:messageId", isAuthenticated, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        
        // Check if user owns the message
        if (message.sender.toString() !== req.payload._id) {
            return res.status(403).json({ message: "Not authorized to edit this message" });
        }

        const updatedMessage = await Message.findByIdAndUpdate(
            req.params.messageId,
            {
                content: req.body.content,
                lastEdited: new Date()
            },
            { new: true }
        ).populate('sender');

        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete
router.delete("/:messageId", isAuthenticated, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        
        // Check if user owns the message
        if (message.sender.toString() !== req.payload._id) {
            return res.status(403).json({ message: "Not authorized to delete this message" });
        }

        const deletedMessage = await Message.findByIdAndUpdate(
            req.params.messageId,
            { 
                isDeleted: true,
                content: "This message has been deleted" 
            },
            { new: true }
        );

        res.status(200).json({ message: "Message deleted", deletedMessage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;