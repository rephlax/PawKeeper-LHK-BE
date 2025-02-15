const LocationPin = require("../models/LocationPin.model");

const locationSocketHandlers = (io, socket) => {
	if (!socket.user) {
		socket.disconnect(true);
		return;
	}

	socket.on("share_location", async (locationData, callback) => {
		try {
			if (!isValidLocation(locationData)) {
				return callback({ error: "Invalid location data" });
			}

			if (!socket.user.sitter) {
				return callback({ error: "Not authorized" });
			}

			const updatedPin = await LocationPin.findOneAndUpdate(
				{ user: socket.user._id },
				{
					location: {
						type: "Point",
						coordinates: [locationData.lng, locationData.lat], // MongoDB expects [longitude, latitude]
					},
				},
				{ upsert: true, new: true }
			);

			const nearbyUsers = await findNearbyUsers(locationData);
			nearbyUsers.forEach((user) => {
				io.to(user.socketId).emit("nearby_sitter_update", updatedPin);
			});

			callback({ success: true, pin: updatedPin });
		} catch (error) {
			console.error("Location update error:", error);
			callback({ error: "Location update failed" });
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
			const nearbyUsers = await findUsersInBounds(viewport);
			socket.emit("nearby_users", nearbyUsers);
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
