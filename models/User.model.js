const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
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
    username: {type: String, unique: true},
    profilePicture: {type: String},
    rate: {type: Number},
    location: {type:{type: String}, coordinates: [Number]},
    rating: {type: Number},
    reviews: {type: [String]}
  },
  // {
  //   // this second object adds extra properties: `createdAt` and `updatedAt`    
  //   timestamps: true
  // }
);

const User = model("User", userSchema);

module.exports = User;
