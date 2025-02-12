const isAuthenticated = require("../middlewares/auth.middleware");
const PetModel = require("../models/Pet.model");
const UserModel = require("../models/User.model");

const router = require("express").Router();





router.post("/:userId", isAuthenticated, async (req, res) => {
  const { userId } = req.params;

  try {
    const newPet = {
      petName: req.body.petName,
      petAge: req.body.petAge,
      petSpecies: req.body.petSpecies,
      owner: req.body.owner
    };

    const pet = (await PetModel.create(newPet)).populate("owner");
    console.log(pet);

    const beforePopulate = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { ownedPets: pet._id } },
      { new: true }
    );
    console.log(beforePopulate);
    const updatedUser = await UserModel.findOne({ _id: userId })
      .populate("ownedPets")
      .lean();

    console.log("User after populating", JSON.stringify(updatedUser, null, 2));

    res
      .status(201)
      .json({ message: "Pet added sucessfully", updatedUser, pet });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.get("/:userId", isAuthenticated, async (req, res) => {
  const {userId} = req.params

  try {
    const allPets = await PetModel.find({owner: userId});

    res.status(200).json(allPets);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.delete("/:petId", isAuthenticated, async(req, res) => {
  const {petId} = req.params;

  try {
    const deletedPet = await PetModel.findByIdAndDelete(petId);

    res.status(204).json(deletedPet)
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
})

//TODO: create Pet routes to get pets by id
module.exports = router;
