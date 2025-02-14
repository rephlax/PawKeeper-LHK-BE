const router = require("express").Router();
const mongoose = require('mongoose');
const LocationPin = require("../models/LocationPin.model");
const UserModel = require("../models/User.model");
const isAuthenticated = require("../middlewares/auth.middleware");

// Create location pin
router.post("/create", isAuthenticated, async (req, res) => {
    try {
        const existingPin = await LocationPin.findOne({ user: req.payload._id });
        if (existingPin) {
            return res.status(400).json({ message: "You already have a location pin" });
        }

        const user = await UserModel.findById(req.payload._id);
        if (!user.sitter) {
            return res.status(403).json({ message: "Only pet sitters can create location pins" });
        }

        const newPin = await LocationPin.create({
            user: req.payload._id,
            title: req.body.title,
            description: req.body.description,
            location: {
                type: 'Point',
                coordinates: [req.body.longitude, req.body.latitude]
            },
            serviceRadius: req.body.serviceRadius,
            services: req.body.services,
            availability: req.body.availability,
            hourlyRate: req.body.hourlyRate
        });

        res.status(201).json(newPin);
    } catch (error) {
        console.error('Pin creation error:', error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
});

router.get("/:pinId", isAuthenticated, async (req, res) => {
    try {
        const pin = await LocationPin.findById(req.params.pinId)
            .populate('user', 'username profilePicture');
        
        if (!pin) {
            return res.status(404).json({ message: "Pin not found" });
        }

        res.status(200).json(pin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/search", isAuthenticated, async (req, res) => {
    try {
        const { 
            latitude, 
            longitude, 
            maxDistance = 10, 
            userId 
        } = req.query;

        if (userId) {
            try {
                const userPin = await LocationPin.findOne({ user: userId })
                    .populate('user', 'username profilePicture sitter');
                return res.status(200).json(userPin ? [userPin] : []);
            } catch (error) {
                console.error('Error finding user pin:', error);
                return res.status(400).json({ message: 'Invalid user ID format' });
            }
        }

        if (latitude && longitude) {
            const pins = await LocationPin.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [
                                parseFloat(longitude), 
                                parseFloat(latitude)
                            ]
                        },
                        distanceField: "distance",
                        maxDistance: maxDistance * 1000,
                        spherical: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" }
            ]);

            return res.status(200).json(pins);
        }

        res.status(200).json([]);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update location pin
router.put("/update", isAuthenticated, async (req, res) => {
    try {
        const pin = await LocationPin.findOne({ user: req.payload._id });
        
        if (!pin) {
            return res.status(404).json({ message: "No location pin found" });
        }

        const updatedPin = await LocationPin.findByIdAndUpdate(
            pin._id, 
            req.body, 
            { new: true }
        );

        res.status(200).json(updatedPin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete location pin
router.delete("/delete", isAuthenticated, async (req, res) => {
    try {
        const pin = await LocationPin.findOne({ user: req.payload._id });
        
        if (!pin) {
            return res.status(404).json({ message: "No location pin found" });
        }

        await LocationPin.findByIdAndDelete(pin._id);

        res.status(200).json({ message: "Location pin deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;