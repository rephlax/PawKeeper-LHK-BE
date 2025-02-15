const isAuthenticated = require("../middlewares/auth.middleware");
const PetModel = require("../models/Pet.model");
const UserModel = require("../models/User.model");

const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const allPets = await PetModel.find()

    res.status(200).json({message: "Here are all the pets", allPets})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
})

router.post("/:userId", isAuthenticated, async (req, res) => {
  const { userId } = req.params;

  try {
    const newPet = {
      petName: req.body.petName,
      petAge: req.body.petAge,
      petSpecies: req.body.petSpecies,
      petPicture: req.body.petPicture,
      owner: req.body.owner,
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
  const { userId } = req.params;

  try {
    const allPets = await PetModel.find({ owner: userId });

    res.status(200).json(allPets);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.patch("/:petId", isAuthenticated, async (req, res) => {
  const { petId } = req.params;
  try {
    const petToUpdate = await PetModel.findByIdAndUpdate(petId, req.body, {
      new: true,
    });

    res.status(200).json({ message: "Pet Updated.", petToUpdate });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.get("/:userId/:petId", isAuthenticated, async (req, res) => {
  const { petId , userId} = req.params;
  console.log(req.params)
  console.log(petId)
  try {
    const onePet = await PetModel.findOne({ _id: petId , owner: userId});
    if (!onePet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.status(200).json(onePet);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

router.delete("/:petId", isAuthenticated, async (req, res) => {
  const { petId } = req.params;

  try {
    const deletedPet = await PetModel.findByIdAndDelete(petId);

    res.status(204).json(deletedPet);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error}` });
  }
});

//TODO: create Pet routes to get pets by id
module.exports = router;
