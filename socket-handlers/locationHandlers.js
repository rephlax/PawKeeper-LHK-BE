const LocationPin = require("../models/LocationPin.model");

const locationSocketHandlers = (io, socket) => {
	if (!socket.user) {
		socket.disconnect(true);
		return;
	}

	socket.on("share_location", async (locationData) => {
		try {
			console.log("Received location data:", {
				locationData,
				user: socket.user,
				socketId: socket.id,
			});

			if (!isValidLocation(locationData)) {
				console.error("Invalid location data:", locationData);
				socket.emit("location_error", { error: "Invalid location data" });
				return;
			}

			if (!socket.user) {
				console.error("No user in socket");
				socket.emit("location_error", { error: "User not authenticated" });
				return;
			}

			if (!socket.user.sitter) {
				console.error("User not a sitter:", socket.user);
				socket.emit("location_error", {
					error: "Not authorized - user must be a sitter",
				});
				return;
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
			socket.emit("location_updated", { success: true, pin: updatedPin });
		} catch (error) {
			console.error("Location update error:", {
				error: error.message,
				stack: error.stack,
				locationData,
				user: socket.user,
			});
			socket.emit("location_error", {
				error: "Location update failed",
				details: error.message,
			});
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
		// not broadcasting anymore
		if (isValidLocation(location)) {
			socket.emit("center_map", {
				...location,
				userId: socket.user._id,
			});
		}
	});

	socket.on("toggle_pin_creation", (data) => {
		if (socket.user.sitter) {
			socket.emit("toggle_pin_creation", data);
		}
	});

	socket.on("viewport_update", async (viewport) => {
		try {
			socket.viewport = viewport;

			// Validation for viewport and bounds
			if (!viewport?.zoom || !viewport?.bounds) {
				console.log("Invalid viewport data:", viewport);
				return;
			}

			if (viewport.zoom >= 9) {
				const bounds = viewport.bounds;

				// Validate all bounds values exist
				if (!bounds.north || !bounds.south || !bounds.east || !bounds.west) {
					console.log("Invalid bounds data:", bounds);
					return;
				}

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
		} catch (error) {
			console.error("Viewport update error:", error);
		}
	});

	socket.on('pin_created', async () => {
		try {
		  const pin = await LocationPin.findOne({ user: socket.user._id }).populate(
			"user",
			"username profilePicture"
		  );
	  
		  if (pin) {
			socket.emit('user_pin_created', {
			  pin,
			  userId: socket.user._id,
			});
		  }
		} catch (error) {
		  console.error("Error handling pin creation:", error);
		}
	  });

	  Copysocket.on('pin_updated', async () => {
		try {
		  const pin = await LocationPin.findOne({ user: socket.user._id }).populate(
			"user",
			"username profilePicture"
		  );
	  
		  if (pin) {
			socket.emit('user_pin_updated', {
			  pin,
			  userId: socket.user._id,
			});
		  }
		} catch (error) {
		  console.error("Error handling pin update:", error);
		}
	  });

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
