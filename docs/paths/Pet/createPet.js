module.exports = {
  post: {
    tags: ["Pet CRUD operations"], // operation's tag.
    description: "Creates a new Pet with the user as it's owner", // operation's desc.
    operationId: "createPet", // unique operation id.
    parameters: [], // expected params.
    requestBody: {
      // expected request body
      content: {
        // content-type
        "application/json": {
          schema: {
            $ref: "#/components/schemas/PetModel", // todo input data model
          },
        },
      },
    },
    // expected responses
    responses: {
      // response code
      400: {
        description: "Invalid request",
      },

      200: {
        description: "Pet created successfully", // response desc.
        content: {
          // content-type
          "application/json": {
            schema: {
              $ref: "#/components/schemas/PetModel",
            },
          },
        },
      },
    },
  },
};
