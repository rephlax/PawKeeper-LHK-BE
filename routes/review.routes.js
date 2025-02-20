const router = require("express").Router();
const mongoose = require("mongoose"); // Add this import
const isAuthenticated = require("../middlewares/auth.middleware");
const ReviewModel = require("../models/Review.model");
const UserModel = require("../models/User.model.js");

// Get reviews for a user
router.get("/:userId", async (req, res) => {
	const { userId } = req.params;
	try {
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ message: "Invalid user ID format" });
		}

		const allReviews = await ReviewModel.find({ reviewedUser: userId })
			.populate("creator", "username profilePicture")
			.sort({ createdAt: -1 });

		res.status(200).json({
			message: "Reviews retrieved successfully",
			allReviews,
		});
	} catch (error) {
		console.error("Error fetching reviews:", error);
		res.status(500).json({
			message: "Failed to fetch reviews",
			error: error.message,
		});
	}
});

// Create a review
router.post("/:userId", isAuthenticated, async (req, res) => {
	try {
		const { userId } = req.params;
		const creatorId = req.payload._id;

		// Validate user IDs
		if (
			!mongoose.Types.ObjectId.isValid(userId) ||
			!mongoose.Types.ObjectId.isValid(creatorId)
		) {
			return res.status(400).json({ message: "Invalid user ID format" });
		}

		// Check if user exists
		const user = await UserModel.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Prevent self-reviews
		if (userId === creatorId) {
			return res.status(400).json({ message: "Cannot review yourself" });
		}

		// // Check for existing review
		// const existingReview = await ReviewModel.findOne({
		// 	creator: creatorId,
		// 	reviewedUser: userId,
		// });

		// if (existingReview) {
		// 	return res
		// 		.status(400)
		// 		.json({ message: "You have already reviewed this user" });
		// }

		// Validate input
		if (
			!req.body.title?.trim() ||
			!req.body.description?.trim() ||
			!req.body.rating
		) {
			return res.status(400).json({
				message: "Title, description and rating are required",
			});
		}

		if (req.body.rating < 1 || req.body.rating > 5) {
			return res.status(400).json({
				message: "Rating must be between 1 and 5",
			});
		}

		const newReview = {
			title: req.body.title.trim(),
			description: req.body.description.trim(),
			rating: parseInt(req.body.rating),
			creator: creatorId,
			reviewedUser: userId,
		};

		const review = await ReviewModel.create(newReview);

		const session = await mongoose.startSession();
		try {
			await session.withTransaction(async () => {
				await Promise.all([
					UserModel.findByIdAndUpdate(
						userId,
						{ $push: { reviewsReceived: review._id } },
						{ session, new: true }
					),
					UserModel.findByIdAndUpdate(
						creatorId,
						{ $push: { reviewsGiven: review._id } },
						{ session, new: true }
					),
				]);
			});
		} finally {
			await session.endSession();
		}

		const populatedReview = await review.populate(
			"creator",
			"username profilePicture"
		);

		res.status(201).json({
			message: "Review created successfully",
			review: populatedReview,
		});
	} catch (error) {
		console.error("Review creation error:", error);
		res.status(500).json({
			message: "Failed to create review",
			error: error.message,
		});
	}
});

// Update a review
router.patch("/:userId/:reviewId", isAuthenticated, async (req, res) => {
	try {
		const { userId, reviewId } = req.params;

		if (
			!mongoose.Types.ObjectId.isValid(reviewId) ||
			!mongoose.Types.ObjectId.isValid(userId)
		) {
			return res.status(400).json({ message: "Invalid ID format" });
		}

		const review = await ReviewModel.findById(reviewId);
		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		if (review.creator.toString() !== req.payload._id) {
			return res.status(403).json({
				message: "Not authorized to edit this review",
			});
		}

		// Validate input
		if (req.body.title && !req.body.title.trim()) {
			return res.status(400).json({ message: "Title cannot be empty" });
		}
		if (req.body.description && !req.body.description.trim()) {
			return res.status(400).json({ message: "Description cannot be empty" });
		}
		if (req.body.rating && (req.body.rating < 1 || req.body.rating > 5)) {
			return res
				.status(400)
				.json({ message: "Rating must be between 1 and 5" });
		}

		const updatedReview = await ReviewModel.findByIdAndUpdate(
			reviewId,
			{
				title: req.body.title?.trim(),
				description: req.body.description?.trim(),
				rating: req.body.rating ? parseInt(req.body.rating) : review.rating,
			},
			{ new: true }
		).populate("creator", "username profilePicture");

		res.status(200).json({
			message: "Review updated successfully",
			review: updatedReview,
		});
	} catch (error) {
		console.error("Review update error:", error);
		res.status(500).json({
			message: "Failed to update review",
			error: error.message,
		});
	}
});

module.exports = router;
