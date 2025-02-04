const { Schema, model } = require("mongoose");


const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true      
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    },
    ownedPets: {
      type: Schema.Types.ObjectId,
      ref: "pet"
    },
    username: {
      type: String,
      unique: true
      },
    profilePicture: {type: String},
    rate: {type: Number},
    location: {
      //TODO: enable coordinates again
    type: {
      type: String,
      required: [false, 'Location type is required.'], // Ensures "type" is provided
      enum: ['Point'] // Validates that "type" is "Point"
    },
    coordinates: {
      type: [Number], // Array of numbers
      required: [false, 'Coordinates are required.'], // Ensures "coordinates" are provided
      // validate: {
      //   validator: function (value) {
      //     return value.length === 2; // Validates exactly 2 coordinates
      //   },
      //   message: 'Coordinates must have exactly two values: [longitude, latitude].'
      // }
    }
  },
    rating: {type: Number},
    reviewsReceived: {
      type: [Schema.Types.ObjectId], 
      ref: "review"
    },
    reviewsGiven: {
      type: [Schema.Types.ObjectId], 
      ref: "review"
    },
    sitter: {type: Boolean, default: false}
  },
  // {
  //   // this second object adds extra properties: `createdAt` and `updatedAt`    
  //   timestamps: true
  // }
);

const User = model("User", userSchema);

module.exports = User;
