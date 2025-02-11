// socketLocationHandlers.js
const LocationPin = require('../models/LocationPin.model');
const rateLimit = require('express-rate-limit');

const locationSocketHandlers = (io, socket) => {
  if (!socket.user) {
    socket.disconnect(true);
    return;
  }

  // Location sharing event with rate limiting
  socket.on('share_location', async (locationData, callback) => {
    try {
      if (!isValidLocation(locationData)) {
        return callback({ error: 'Invalid location data' });
      }

      if (!socket.user.sitter) {
        return callback({ error: 'Not authorized' });
      }

      // Update or create location pin
      const updatedPin = await LocationPin.findOneAndUpdate(
        { user: socket.user._id },
        {
          location: {
            coordinates: {
              latitude: locationData.lat,
              longitude: locationData.lng
            }
          },
        },
        { upsert: true, new: true }
      );

      const nearbyUsers = await findNearbyUsers(locationData);
      nearbyUsers.forEach(user => {
        io.to(user.socketId).emit('nearby_sitter_update', updatedPin);
      });

      callback({ success: true, pin: updatedPin });
    } catch (error) {
      callback({ error: 'Location update failed' });
    }
  });

  // Search for nearby sitters
  socket.on('search_nearby_sitters', async (searchParams, callback) => {
    try {
      const nearbyPins = await LocationPin.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [searchParams.lng, searchParams.lat]
            },
            distanceField: 'distance',
            maxDistance: searchParams.radius * 1000,
            spherical: true
          }
        }
      ]);

      callback({ sitters: nearbyPins });
    } catch (error) {
      callback({ error: 'Search failed' });
    }
  });
};

// Utility function to validate location
function isValidLocation(locationData) {
  return (
    locationData &&
    typeof locationData.lat === 'number' &&
    typeof locationData.lng === 'number' &&
    locationData.lat >= -90 &&
    locationData.lat <= 90 &&
    locationData.lng >= -180 &&
    locationData.lng <= 180
  );
}

module.exports = locationSocketHandlers;