const LocationPin = require("../models/LocationPin.model");

const locationSocketHandlers = (io, socket) => {
	if (!socket.user) {
		socket.disconnect(true);
		return;
	}

	socket.on("share_location", async (locationData, callback) => {
		try {
			console.log("Received location data:", {
				locationData,
				user: socket.user,
				socketId: socket.id,
			});

			if (!isValidLocation(locationData)) {
				console.error("Invalid location data:", locationData);
				return callback({ error: "Invalid location data" });
			}

			if (!socket.user) {
				console.error("No user in socket");
				return callback({ error: "User not authenticated" });
			}

			if (!socket.user.sitter) {
				console.error("User not a sitter:", socket.user);
				return callback({ error: "Not authorized - user must be a sitter" });
			}

			const updatedPin = await LocationPin.findOneAndUpdate(
				{ user: socket.user._id },
				{
					location: {
						type: "Point",
						coordinates: [locationData.lng, locationData.lat],
					},
				},
				{ upsert: true, new: true }
			);

			console.log("Pin updated:", updatedPin);

			callback({ success: true, pin: updatedPin });
		} catch (error) {
			console.error("Location update error:", {
				error: error.message,
				stack: error.stack,
				locationData,
				user: socket.user,
			});
			callback({ error: "Location update failed", details: error.message });
		}
	});

	socket.on("search_nearby_sitters", async (searchParams, callback) => {
		try {
			const nearbyPins = await LocationPin.aggregate([
				{
					$geoNear: {
						near: {
							type: "Point",
							coordinates: [searchParams.lng, searchParams.lat],
						},
						distanceField: "distance",
						maxDistance: searchParams.radius * 1000,
						spherical: true,
					},
				},
			]);

			callback({ sitters: nearbyPins });
		} catch (error) {
			console.error("Search failed:", error);
			callback({ error: "Search failed" });
		}
	});

	socket.on("center_map", (location) => {
		if (isValidLocation(location)) {
			socket.broadcast.emit("center_map", location);
		}
	});

	socket.on("toggle_pin_creation", (data) => {
		if (socket.user.sitter) {
			socket.broadcast.emit("toggle_pin_creation", data);
		}
	});

	socket.on("viewport_update", async (viewport) => {
		socket.viewport = viewport;

		if (viewport.zoom >= 9) {
			const bounds = {
				north: viewport.bounds.north,
				south: viewport.bounds.south,
				east: viewport.bounds.east,
				west: viewport.bounds.west,
			};

			const nearbyPins = await LocationPin.find({
				"location.coordinates": {
					$geoWithin: {
						$box: [
							[bounds.west, bounds.south],
							[bounds.east, bounds.north],
						],
					},
				},
			}).populate("user", "username profilePicture sitter");

			socket.emit("nearby_pins", nearbyPins);
		}
	});

	socket.on("pin_created", async () => {
		try {
			const pin = await LocationPin.findOne({ user: socket.user._id }).populate(
				"user",
				"username profilePicture"
			);

			if (pin) {
				io.emit("pin_created", {
					pin,
					userId: socket.user._id,
				});
			}
		} catch (error) {
			console.error("Error broadcasting pin creation:", error);
		}
	});
};

// Utility function to validate location
function isValidLocation(locationData) {
	return (
		locationData &&
		typeof locationData.lat === "number" &&
		typeof locationData.lng === "number" &&
		locationData.lat >= -90 &&
		locationData.lat <= 90 &&
		locationData.lng >= -180 &&
		locationData.lng <= 180
	);
}

module.exports = locationSocketHandlers;
