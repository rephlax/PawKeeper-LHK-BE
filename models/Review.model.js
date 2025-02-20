const { Schema, model } = require("mongoose");
// const nameValidator = [
//   validate({
//     validator: "isLength",
//     arguments: [1, 150],
//     message: "Description should be between 3 and 50 characters",
//   }),
// ];

const reviewSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			minlength: [3, "Title must be at least 3 characters"],
			maxlength: [100, "Title cannot exceed 100 characters"],
		},
		description: {
			type: String,
			required: true,
			trim: true,
			minlength: [10, "Description must be at least 10 characters"],
			maxlength: [1000, "Description cannot exceed 1000 characters"],
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		reviewedUser: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

reviewSchema.index({ reviewedUser: 1, createdAt: -1 });
//Allow multiple reviews from one user to the same reviewed sitter
reviewSchema.index({ creator: 1, title: 1, description: 1}, { unique: true });

const ReviewModel = model("review", reviewSchema);
module.exports = ReviewModel;
