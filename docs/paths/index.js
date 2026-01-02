const createPet = require("./Pet/createPet");
const deletePet = require("./Pet/deletePet");
const getAllPets = require("./Pet/getAllPets");
const getAllPetsByUserId = require("./Pet/getAllPetsByUserId");
const getOnePetOfOneUser = require("./Pet/getOnePetOfOneUser");
const updatePet = require("./Pet/updatePet");
const deleteUser = require("./User/deleteUser");
const getAllUsers = require("./User/getAllUsers");
const getUserById = require("./User/getUserById");
const loginUser = require("./User/loginUser");
const passwordChange = require("./User/passwordChange");
const signupUser = require("./User/signupUser");
const updateUser = require("./User/updateUser");
const verifyUser = require("./User/verifyUser");

module.exports = {
  paths: {
    "/users/": {
      ...getAllUsers,
    },
    "/users/user/{userId}": {
      ...getUserById,
    },

    "/users/veerify": {
      ...verifyUser,
    },
    "/users/signup": {
      ...signupUser,
    },
    "/users/login": {
      ...loginUser,
    },

    "/users/update-user/{userId}": {
      ...updateUser,
    },
    "/users/update-user/{userId}/password-change": {
      ...passwordChange,
    },
    "/user/delete-user/{userId}": {
      ...deleteUser,
    },

    "/pets/": {
      ...getAllPets,
    },

    "/pets/{userId}": {
      ...getAllPetsByUserId,
    },

    "/pets/{userId}/{petId}": {
      ...getOnePetOfOneUser,
    },

    "/pets/{userId}": {
      ...createPet,
    },

    "/pets/{petId}": {
        ...updatePet
    },

    "/pets/{petId}": {
        ...deletePet
    }
  },
};
