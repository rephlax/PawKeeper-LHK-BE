module.exports = {
  get: {
    tags: ["User CRUD operations and Authentication"], // operation's tag.
    description: "Get User by ID", // operation's description.
    operationId: "getUserById", // unique operation id.
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
        description: "ID of the user to retrieve",
      },
    ],
    responses: {
      200: {
        description: "User retrieved successfully",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UserModel", // Response model
            },
          },
        },
      },
      404: {
        description: "User not found",
      },
    },
  },
};
