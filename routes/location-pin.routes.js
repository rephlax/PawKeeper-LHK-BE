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

router.get("/search", isAuthenticated, async (req, res) => {
	try {
		const { userId } = req.query;
		console.log("Search request received:", {
			userId,
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
						maxDistance: maxDistance * 1000,
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

// Create location pin
router.post("/create", isAuthenticated, async (req, res) => {
	try {
		console.log("Creating pin with data:", {
			userId: req.payload._id,
			body: req.body,
			auth: req.headers.authorization,
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
				coordinates: [req.body.longitude, req.body.latitude],
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
		res.status(500).json({ message: error.message, stack: error.stack });
	}
});

// Update location pin
router.put("/update", isAuthenticated, async (req, res) => {
	try {
		const user = await UserModel.findById(req.payload._id);
		if (!user.sitter) {
			return res
				.status(403)
				.json({ message: "Only pet sitters can update location pins" });
		}

		// Delete existing pin
		await LocationPin.findOneAndDelete({ user: req.payload._id });

		// Create new pin with updated information
		const updatedPin = await LocationPin.create({
			user: req.payload._id,
			title: req.body.title,
			description: req.body.description,
			location: {
				type: "Point",
				coordinates: [req.body.longitude, req.body.latitude],
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

router.get("/in-bounds", isAuthenticated, async (req, res) => {
	try {
		const { north, south, east, west } = req.query;

		// Validate inputs
		const coordinates = {
			north: parseFloat(north),
			south: parseFloat(south),
			east: parseFloat(east),
			west: parseFloat(west),
		};

		// Early validation
		if (Object.values(coordinates).some(isNaN)) {
			return res.status(400).json({
				message: "Invalid coordinate values",
				details: coordinates,
			});
		}

		// Create polygon points in the correct order
		const polygonCoordinates = [
			[coordinates.west, coordinates.south],
			[coordinates.east, coordinates.south],
			[coordinates.east, coordinates.north],
			[coordinates.west, coordinates.north],
			[coordinates.west, coordinates.south],
		];

		// Validate coordinate ranges
		if (
			!polygonCoordinates.every(
				([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90
			)
		) {
			return res.status(400).json({
				message: "Coordinates out of range",
				details: polygonCoordinates,
			});
		}

		const query = {
			location: {
				$geoWithin: {
					$geometry: {
						type: "Polygon",
						coordinates: [polygonCoordinates],
					},
				},
			},
		};

		const pins = await LocationPin.find(query).populate(
			"user",
			"username profilePicture sitter"
		);

		console.log("Query executed successfully:", {
			bounds: coordinates,
			pinsFound: pins.length,
		});

		return res.status(200).json(pins);
	} catch (error) {
		console.error("Error in in-bounds query:", {
			error: error.message,
			stack: error.stack,
			query: req.query,
		});

		return res.status(500).json({
			message: "Error fetching pins in bounds",
			error: error.message,
		});
	}
});

module.exports = router;
