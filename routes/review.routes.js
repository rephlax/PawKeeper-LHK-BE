const jwt = require("jsonwebtoken");
const router = require("express").Router();
const isAuthenticated = require("../middlewares/auth.middleware");
const ReviewModel = require("../models/Review.model");
const UserModel = require("../models/User.model.js");

router.get("/reviews/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const allReviews = await ReviewModel.find({ reviews: userId.reviews });
    res
      .status(200)
      .json({ message: "here are all the reviews for the user", allReviews });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.post("/:userId", isAuthenticated, async (req, res) => {
  const { userId } = req.params;
  const creatorId = req.payload._id  
  
  try {
    const newReview = {
        title: req.body.title,
        description: req.body.description,
        rating: req.body.rating,
        creator: creatorId,
        reviewedUser: userId
    }
    const review = await ReviewModel.create(newReview);

    const updatedUser = await UserModel.findByIdAndUpdate(userId, {$push: {reviews: review._id}}, {new: true})

    res.status(201).json({message: "Review created sucessfully", review})
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});


module.exports = router;