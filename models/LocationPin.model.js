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
				required: true,
			},
			coordinates: {
				type: [Number], // [longitude, latitude]
				required: true,
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

// Create the 2dsphere index for GMAPS
locationPinSchema.index({ location: "2dsphere" });

module.exports = model("LocationPin", locationPinSchema);
