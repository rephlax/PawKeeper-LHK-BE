const UserModel = require("../models/User.model")
const PetModel = require("../models/Pet.model");
const ReviewModel = require("../models/Review.model");

module.exports = {
  components: {
    schemas: {
      UserModel: {
        type: "object",
        properties: {
          username: {
            type: "string",
            description: "A Username chosen by the user that has to be unique",
          },
          email: {
            type: "string",
            description: "The email of the user, that has to be unique",
          },
          password: {
            type: "string",
          },
          ownedPets: {
            type: "array",
            items: {
              type: "string",
              description: "A MongoDB ObjectId",
              example: "67abe095572ccf8edf71531b",
            },
          },

          profilePicture: {
            type: "string",
            description:
              "the URL of the User's profile picture uploaded to Cloudinary",
            example:
              "https://res.cloudinary.com/dzdrwiugn/image/upload/v1738960059/JavaScript_Intermediate_eoeawn.png",
          },
          rate: {
            type: "number",
            description:
              "Determines how much the user gets paid for the service",
            example: "$20",
            default: 0,
          },
          location: {
            type: {
              type: "string",
              enum: ["Point"],
            },
            coordinates: {
              latitude: { type: "number", default: 0 },
              longitude: { type: "number", default: 0 },
            },
          },
          rating: {
            type: "number",
            default: 0,
            description:
              "The average of all the received ratings from other users",
          },
          reviewsReceived: {
            type: "array",
            items: {
              type: "string",
              description: "A MongoDB ObjectId",
              example: "67abe095572ccf8edf71531b",
            },
            description: "All the reviews the user received from other users",
          },
          reviewsGiven: {
            type: "array",
            items: {
              type: "string",
              description: "A MongoDB ObjectId",
              example: "67abe095572ccf8edf71531b",
            },
            description: "All the reviews the user gave to other users",
          },
          sitter: {
            type: "boolean",
            default: false,
            description:
              "Defines if the user is available to provide the pet sitting services",
          },
        },
      },

      PetModel: {
        type: "object",
        properties: {
          petName: { type: "string", description: "The name of the pet" },
          petAge: { type: "number", description: "The age of the pet" },
          petSpecies: {
            type: "string",
            description: "The species of the pet",
            example: "Cat, Dog, Snake",
          },
          petPicture: {
            type: "string",
            description: "The URL of a pet picture uploaded to Cloudinary",
            example:
              "https://res.cloudinary.com/dzdrwiugn/image/upload/v1738960059/JavaScript_Intermediate_eoeawn.png",
          },
          owner: {
            type: "string",
            description: "A MongoDB ObjectId of the owner of the pet",
            example: "67abe095572ccf8edf71531b",
          },
        },
      },

      ReviewModel: {
        type: "object",
        properties: {
          title: { type: "string", description: "Review title" },
          description: { type: "string", description: "The review to give to the user" },
          rating: { type: "number", description: "A rating to give the user between 1 and 5", example: "2" },
          creator: { type: "string", description: "A MongoDB ObjectId of the creator of the review", example: "67abe095572ccf8edf71531b" },
          reviewedUser: { type: "string", description: "A MongoDB ObjectId of the receiver of the review", example: "67abe095572ccf8edf71531b" },
        },
      },      
    },
  },
};
