const router = require("express").Router();
const mongoose = require("mongoose");
const LocationPin = require("../models/LocationPin.model");
const UserModel = require("../models/User.model");
const isAuthenticated = require("../middlewares/auth.middleware");

router.get("/all-pins", isAuthenticated, async (req, res) => {
	try {
		console.log("Fetching all pins, auth user:", req.payload);
		const allPins = await LocationPin.find().populate(
			"user",
			"username profilePicture sitter"
		);
		console.log("Found pins:", allPins.length);
		res.status(200).json(allPins);
	} catch (error) {
		console.error("Error fetching all pins:", {
			error: error.message,
			stack: error.stack,
			user: req.payload?._id,
		});
		res.status(500).json({
			message: "Error fetching pins",
			error: error.message,
			details: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
});

router.get("/in-bounds", isAuthenticated, async (req, res) => {
	try {
		const { north, south, east, west, longitude, latitude } = req.query;

		// Validate center coordinates
		if (!longitude || !latitude) {
			return res.status(400).json({
				message: "Missing center coordinates",
			});
		}

		const center = [parseFloat(longitude), parseFloat(latitude)];

		// Use $geoNear for radius filtering to only see pins in your area
		const pins = await LocationPin.aggregate([
			{
				$geoNear: {
					near: {
						type: "Point",
						coordinates: center,
					},
					distanceField: "distance",
					maxDistance: 50000, // 50km in meters
					spherical: true,
				},
			},
			{
				$match: {
					location: {
						$geoWithin: {
							$box: [
								[parseFloat(west), parseFloat(south)],
								[parseFloat(east), parseFloat(north)],
							],
						},
					},
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "userDetails",
				},
			},
		]);

		console.log("Query executed successfully:", {
			bounds: { north, south, east, west },
			center,
			pinsFound: pins.length,
		});

		return res.status(200).json(pins);
	} catch (error) {
		console.error("Error in in-bounds query:", error);
		return res.status(500).json({
			message: "Error fetching pins in bounds",
			error: error.message,
		});
	}
});

router.get("/search", isAuthenticated, async (req, res) => {
	try {
		const { userId, latitude, longitude, maxDistance = 10 } = req.query;
		console.log("Search request received:", {
			userId,
			latitude,
			longitude,
			maxDistance,
			headers: req.headers,
			auth: req.payload,
		});

		if (userId) {
			if (!mongoose.Types.ObjectId.isValid(userId)) {
				return res.status(400).json({ message: "Invalid user ID format" });
			}

			const userPin = await LocationPin.findOne({ user: userId }).populate(
				"user",
				"username profilePicture sitter"
			);
			return res.status(200).json(userPin ? [userPin] : []);
		}

		if (latitude && longitude) {
			const pins = await LocationPin.aggregate([
				{
					$geoNear: {
						near: {
							type: "Point",
							coordinates: [parseFloat(longitude), parseFloat(latitude)],
						},
						distanceField: "distance",
						maxDistance: parseFloat(maxDistance) * 1000,
						spherical: true,
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "user",
						foreignField: "_id",
						as: "userDetails",
					},
				},
				{ $unwind: "$userDetails" },
			]);

			return res.status(200).json(pins);
		}

		res.status(200).json([]);
	} catch (error) {
		console.error("Search error details:", {
			message: error.message,
			stack: error.stack,
			userId: req.query.userId,
		});
		res.status(500).json({
			message: error.message,
			details: error.stack,
		});
	}
});

router.get("/:pinId", isAuthenticated, async (req, res) => {
	try {
		const pin = await LocationPin.findById(req.params.pinId).populate(
			"user",
			"username profilePicture"
		);

		if (!pin) {
			return res.status(404).json({ message: "Pin not found" });
		}

		res.status(200).json(pin);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.post("/create", isAuthenticated, async (req, res) => {
	try {
		console.log("Creating pin with data:", {
			userId: req.payload._id,
			body: req.body,
		});

		const user = await UserModel.findById(req.payload._id);
		if (!user.sitter) {
			return res
				.status(403)
				.json({ message: "Only pet sitters can create location pins" });
		}

		if (!req.body.longitude || !req.body.latitude) {
			return res.status(400).json({
				message: "Invalid location data",
				details: {
					longitude: req.body.longitude,
					latitude: req.body.latitude,
				},
			});
		}

		await LocationPin.findOneAndDelete({ user: req.payload._id });

		const newPin = await LocationPin.create({
			user: req.payload._id,
			title: req.body.title,
			description: req.body.description,
			location: {
				type: "Point",
				coordinates: [
					parseFloat(req.body.longitude),
					parseFloat(req.body.latitude),
				],
			},
			serviceRadius: req.body.serviceRadius,
			services: req.body.services,
			availability: req.body.availability,
			hourlyRate: req.body.hourlyRate,
		});

		console.log("Pin created successfully:", newPin);
		res.status(201).json(newPin);
	} catch (error) {
		console.error("Pin creation error:", {
			error: error.message,
			stack: error.stack,
			body: req.body,
		});
		res.status(500).json({ message: error.message });
	}
});

router.put("/update", isAuthenticated, async (req, res) => {
	try {
		const user = await UserModel.findById(req.payload._id);
		if (!user.sitter) {
			return res
				.status(403)
				.json({ message: "Only pet sitters can update location pins" });
		}

		if (!req.body.longitude || !req.body.latitude) {
			return res.status(400).json({
				message: "Invalid location data",
				details: {
					longitude: req.body.longitude,
					latitude: req.body.latitude,
				},
			});
		}

		await LocationPin.findOneAndDelete({ user: req.payload._id });

		const updatedPin = await LocationPin.create({
			user: req.payload._id,
			title: req.body.title,
			description: req.body.description,
			location: {
				type: "Point",
				coordinates: [
					parseFloat(req.body.longitude),
					parseFloat(req.body.latitude),
				],
			},
			serviceRadius: req.body.serviceRadius,
			services: req.body.services,
			availability: req.body.availability,
			hourlyRate: req.body.hourlyRate,
		});

		res.status(200).json(updatedPin);
	} catch (error) {
		console.error("Pin update error:", error);
		res.status(500).json({ message: error.message });
	}
});

router.delete("/:pinId", isAuthenticated, async (req, res) => {
	try {
		const pin = await LocationPin.findOneAndDelete({ _id: req.params.pinId });

		if (!pin) {
			return res.status(404).json({ message: "Pin not found" });
		}

		req.app.io.emit("pin_deleted", pin._id);

		res.status(200).json({ message: "Pin deleted successfully" });
	} catch (error) {
		console.error("Error deleting pin:", error);
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
