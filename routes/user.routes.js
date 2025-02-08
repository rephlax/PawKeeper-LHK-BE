const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User.model");
const isAuthenticated = require("../middlewares/auth.middleware");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  try {
    const allUsers = await UserModel.find();
    res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(12);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const hashedUser = {
      email: req.body.email,
      password: hashedPassword,
      username: req.body.username,
      ownedPets: req.body.ownedPets,
      profilePicture: req.body.profilePicture,
      rate: req.body.rate || 0,
      location: req.body.location,
      rating: req.body.rating,
      reviews: req.body.reviews,
      sitter: req.body.sitter,
    };
    console.log(req.body);
    const createdUser = await UserModel.create(hashedUser);
    console.log(createdUser);
    res.status(201).json({ message: "User created Sucessfuly", createdUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.post("/login", async (req, res) => {
  try {
    const foundUser = await UserModel.findOne({ email: req.body.email });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    } else {
      const isValidPassword = bcrypt.compareSync(
        req.body.password,
        foundUser.password        
      );

      if (isValidPassword) {
        const data = { _id: foundUser._id, email: foundUser.email, username: foundUser.username };
        const authToken = jwt.sign(data, process.env.TOKEN_KEY, {
          algorithm: "HS256",
          expiresIn: "10d",
        });
        res.status(200).json({ message: "here is the token", authToken , userId: foundUser._id});
      } else {
        res.status(403).json({ message: "Invalid Crecentials" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.get("/user/:userId", isAuthenticated, async (req, res) => {
  const {userId} = req.params;
 
  try {
    const oneUser = await UserModel.findById(userId);
    res.status(200).json(oneUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.patch("/update-user/:userId", isAuthenticated, async (req, res) => {
  const { userId } = req.params;
  console.log(req.body)
  try {
    const foundUser = await UserModel.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    console.log(foundUser)
    res.status(200).json({ message: "User updated successfully", foundUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.patch("/update-user/:userId/password-change", isAuthenticated, (req, res) => {
  
})

router.delete("/delete-user/:userId", isAuthenticated, async (req, res) => {
  const { userId } = req.params;
  
  try {
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    res.status(200).json({ message: "User Sucessfuly deleted", deletedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.get("/verify", isAuthenticated, async (req, res) => {
  res
    .status(200)
    .json({ message: "user is authenticated", currentUser: req.payload });
});

module.exports = router;
