const router = require("express").Router();
const ChatRoom = require("../models/Room.model");
const isAuthenticated = require("../middlewares/auth.middleware");

// Get all rooms for a user
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const rooms = await ChatRoom.find({
            participants: req.payload._id
        })
        .populate('participants', 'username profilePicture')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific room
router.get("/:roomId", isAuthenticated, async (req, res) => {
    try {
        const room = await ChatRoom.findById(req.params.roomId)
            .populate('participants', 'username profilePicture')
            .populate('lastMessage');

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (!room.participants.some(p => p._id.toString() === req.payload._id)) {
            return res.status(403).json({ message: "Not authorized to view this room" });
        }

        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new room
router.post("/create", isAuthenticated, async (req, res) => {
    try {
        const { name, type, participants } = req.body;

        const newRoom = await ChatRoom.create({
            name,
            type,
            participants: [req.payload._id, ...participants],
            creator: req.payload._id
        });

        const populatedRoom = await newRoom.populate('participants', 'username profilePicture');
        res.status(201).json(populatedRoom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a room
router.patch("/update/:roomId", isAuthenticated, async (req, res) => {
    try {
        const room = await ChatRoom.findById(req.params.roomId);
        
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (room.creator.toString() !== req.payload._id) {
            return res.status(403).json({ message: "Not authorized to update this room" });
        }

        const updatedRoom = await ChatRoom.findByIdAndUpdate(
            req.params.roomId,
            req.body,
            { new: true }
        ).populate('participants', 'username profilePicture');

        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a room
router.delete("/delete/:roomId", isAuthenticated, async (req, res) => {
    try {
        const room = await ChatRoom.findById(req.params.roomId);
        
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (room.creator.toString() !== req.payload._id) {
            return res.status(403).json({ message: "Not authorized to delete this room" });
        }

        await ChatRoom.findByIdAndDelete(req.params.roomId);
        res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;