const { Schema, model } = require("mongoose");

const locationPinSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (v) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message: "Invalid coordinates",
        },
      },
    },
    serviceRadius: {
      type: Number,
      default: 10,
      min: 1,
      max: 50,
    },
    services: [
      {
        type: String,
        enum: [
          "Dog Walking",
          "Cat Sitting",
          "Pet Boarding",
          "Pet Grooming",
          "Reptile Care",
          "Bird Sitting",
        ],
      },
    ],
    availability: {
      type: String,
      enum: ["Full Time", "Part Time", "Weekends Only"],
      default: "Part Time",
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

locationPinSchema.index({ location: "2dsphere" });

module.exports = model("LocationPin", locationPinSchema);
