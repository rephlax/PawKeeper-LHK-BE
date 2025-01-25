const router = require("express").Router();
const bcrypt = require("bcryptjs");
const token = require("jsonwebtoken");
const UserModel = require("../models/User.model");

router.post("/signup", async (req, res) => {
    try {
        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);
        const hashedUser = {
            email: req.body.email,
            password: hashedPassword
        }

        const createdUser = await UserModel.create(hashedUser)
        console.log(createdUser)
        res.status(201).json({message: "User created Sucessfuly", createdUser})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: `${error}`})
    }
})
module.exports = router;