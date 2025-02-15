module.exports = {
  patch: {
    tags: ["User CRUD operations and Authentication"], // operation's tag.
    description: "Update User", // operation's description.
    operationId: "updateUser", // unique operation id.
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
        description: "ID of the user to update",
      },
    ],

    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/UserModel",
          },
        },
      },
    },
    responses: {
      200: {
        description: "User updated successfully",
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
