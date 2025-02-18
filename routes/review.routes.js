const jwt = require("jsonwebtoken");
const router = require("express").Router();
const isAuthenticated = require("../middlewares/auth.middleware");
const ReviewModel = require("../models/Review.model");
const UserModel = require("../models/User.model.js");

router.get("/:userId", async (req, res) => {
	const { userId } = req.params;
	try {
		const allReviews = await ReviewModel.find({ reviewedUser: userId })
			.populate("creator", "username profilePicture")
			.sort({ createdAt: -1 });
		res
			.status(200)
			.json({ message: "here are all the reviews for the user", allReviews });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: `${error}` });
	}
});

router.post("/:userId", isAuthenticated, async (req, res) => {
	try {
		const { userId } = req.params;
		const creatorId = req.payload._id;

		if (!req.body.title || !req.body.description || !req.body.rating) {
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
			title: req.body.title,
			description: req.body.description,
			rating: parseInt(req.body.rating),
			creator: creatorId,
			reviewedUser: userId,
		};

		const review = await ReviewModel.create(newReview);

		await Promise.all([
			UserModel.findByIdAndUpdate(
				userId,
				{ $push: { reviewsReceived: review._id } },
				{ new: true }
			),
			UserModel.findByIdAndUpdate(
				creatorId,
				{ $push: { reviewsGiven: review._id } },
				{ new: true }
			),
		]);

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

router.patch("/:userId/:reviewId", isAuthenticated, async (req, res) => {
	try {
		const { userId, reviewId } = req.params;

		const review = await ReviewModel.findById(reviewId);
		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		if (review.creator.toString() !== req.payload._id) {
			return res
				.status(403)
				.json({ message: "Not authorized to edit this review" });
		}

		const updatedReview = await ReviewModel.findByIdAndUpdate(
			reviewId,
			{
				title: req.body.title,
				description: req.body.description,
				rating: req.body.rating,
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
