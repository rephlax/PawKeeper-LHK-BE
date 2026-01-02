module.exports = {
    get: {
        tags: ["Pet CRUD operations"], // operation's tag.
        description: "Get all Pets by User ID", // operation's desc.
        operationId: "getPetsByUserId", // unique operation id.
        parameters: [
            {
                name: "userId", // parameter name
                in: "query", // location of the parameter
                required: true, // indicates whether the parameter is mandatory
                description: "ID of the user to retrieve pets for", // description of the parameter
                schema: {
                    type: "string", // expected type of the parameter
                },
            },
        ], // expected params.
        requestBody: {},
        // expected responses
        responses: {
          // response code
          400: {
              description: "Invalid request", // bad request response
          },
  
          200: {
            description: "Pets retrieved successfully for the user", // response desc.
            content: {
              // content-type
              "application/json": {
                schema: {
                  type: "array", // indicating an array of pets
                  items: {
                    $ref: "#/components/schemas/PetModel", // reference to the Pet model
                  },
                },
              },
            },
          },

          404: {
            description: "User not found", // user not found response
          },
        },
    }
}
