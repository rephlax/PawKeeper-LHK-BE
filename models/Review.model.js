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
      required: true
     },
    description: { 
      type: String, 
      required: true
     },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    creator: { 
      type: Schema.Types.ObjectId, 
      ref: "User"
    },
    reviewedUser: {
      type: Schema.Types.ObjectId, 
      ref: "User"
    }
  },
  {
    timestamps: true,
  }
);

const ReviewModel = model("review", reviewSchema);
module.exports = ReviewModel;
