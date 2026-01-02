module.exports = {
    get: {
        tags: ["User CRUD operations and Authentication"], // operation's tag.
        description: "Get all Users", // operation's desc.
        operationId: "getAllUsers", // unique operation id.
        parameters: [], // expected params.
        requestBody: {},
        // expected responses
        responses: {
          // response code
          400: {
              description: "Invalid request",
          },
  
          200: {
            description: "Users retrieved successfully", // response desc.
            content: {
              // content-type
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UserModel", // Todo model
                },
              },
            },
          },
        },
    }
}