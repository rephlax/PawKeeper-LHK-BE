module.exports = {
    patch: {
        tags: ["User CRUD operations and Authentication"], // operation's tag.
        description: "Change User Password", // operation's description.
        operationId: "changeUserPassword", // unique operation id.
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "ID of the user whose password is being changed"
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserModel", // Request body schema for password change
              },
            },
          },
        },
        responses: {
          200: {
            description: "Password updated successfully",
          },
          400: {
            description: "Invalid request body or weak password",
          },
          404: {
            description: "User not found",
          },
        },
    }
}