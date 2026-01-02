module.exports = {
    get: {
        tags: ["Pet CRUD operations"], // operation's tag.
        description: "Get all Pets", // operation's desc.
        operationId: "getAllPets", // unique operation id.
        parameters: [], // expected params.
        requestBody: {},
        // expected responses
        responses: {
          // response code
          400: {
              description: "Invalid request",
          },
  
          200: {
            description: "Pets retrieved successfully", // response desc.
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
    }
}