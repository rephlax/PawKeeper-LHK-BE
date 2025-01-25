const {Schema, model} = require("mongoose");

const reviewSchema = new Schema({})

const ReviewModel = model("review", reviewSchema)
module.exports = ReviewModel;